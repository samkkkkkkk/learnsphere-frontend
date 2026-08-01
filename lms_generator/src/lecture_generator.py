"""
강의 생성 엔진

RAG 검색과 GPT-4o를 활용하여 고품질 UniTask 강의를 생성
unitask_lecture_example.md와 동일한 수준의 강의 제작
"""

import os
import json
import time
from typing import Dict, List, Any
from datetime import datetime

import openai
from qdrant_client import QdrantClient
from dotenv import load_dotenv

from config import (
    get_subject_paths,
    get_qdrant_collection_name, 
    RAG_CONFIG,
    GENERATION_CONFIG,
    EXAMPLES_DIR,
    BASE_DIR
)
from curriculum_manager import CurriculumManager

# 환경 변수 로드
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

class LectureGenerator:
    """강의 생성 클래스"""
    
    def __init__(self, subject: str):
        self.subject = subject
        self.paths = get_subject_paths(subject)
        self.collection_name = get_qdrant_collection_name(subject)
        
        # OpenAI 클라이언트 초기화
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Qdrant 클라이언트 초기화
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_client = QdrantClient(url=qdrant_url)
        
        # 커리큘럼 매니저 초기화
        self.curriculum_manager = CurriculumManager(subject)
        
        # 품질 기준 템플릿 로드
        self.quality_template = self._load_quality_template()
        
    def _load_quality_template(self) -> str:
        """품질 기준 템플릿 로드"""
        template_path = os.path.join(EXAMPLES_DIR, f"{self.subject}_lecture_example.md")
        
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"품질 기준 템플릿이 없습니다: {template_path}")
            
        with open(template_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def search_rag_context(self, query: str, top_k: int = None) -> List[str]:
        """RAG에서 관련 컨텍스트 검색"""
        if top_k is None:
            top_k = RAG_CONFIG["top_k_results"]
            
        print(f"🔍 RAG 검색 중: '{query[:50]}...'")
        
        try:
            # 쿼리를 임베딩으로 변환
            response = self.openai_client.embeddings.create(
                model=RAG_CONFIG["embedding_model"],
                input=query
            )
            query_vector = response.data[0].embedding
            
            # Qdrant에서 유사한 벡터 검색
            search_result = self.qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                with_payload=True
            )
            
            # 결과 추출
            contexts = []
            for hit in search_result:
                context_info = {
                    "text": hit.payload["text"],
                    "file_path": hit.payload["file_path"],
                    "score": hit.score
                }
                contexts.append(context_info)
            
            print(f"✅ {len(contexts)}개 컨텍스트 검색 완료")
            return contexts
            
        except Exception as e:
            print(f"❌ RAG 검색 실패: {e}")
            raise
    
    def _direct_search_rag(self, query: str, top_k: int = 5) -> List[Dict]:
        """로그 출력 없이 직접 RAG 검색 (내부용)"""
        try:
            # 쿼리를 임베딩으로 변환
            response = self.openai_client.embeddings.create(
                model=RAG_CONFIG["embedding_model"],
                input=query
            )
            query_vector = response.data[0].embedding
            
            # Qdrant에서 유사한 벡터 검색
            search_result = self.qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                with_payload=True
            )
            
            # 결과 추출
            contexts = []
            for hit in search_result:
                context_info = {
                    "text": hit.payload["text"],
                    "file_path": hit.payload["file_path"],
                    "score": hit.score
                }
                contexts.append(context_info)
            
            return contexts
            
        except Exception as e:
            print(f"⚠️ 쿼리 '{query[:30]}...' 검색 실패: {e}")
            return []
    
    def search_multiple_queries(self, queries: List[str]) -> List[Dict]:
        """여러 쿼리로 RAG 검색 후 중복 제거하여 병합"""
        all_contexts = []
        seen_texts = set()
        
        for i, query in enumerate(queries, 1):
            print(f"🔍 쿼리 {i}/{len(queries)}: '{query[:40]}...'")
            
            try:
                contexts = self._direct_search_rag(query, top_k=3)  # 직접 검색으로 로그 중복 방지
                
                for ctx in contexts:
                    # 중복 제거 (텍스트 앞 100자로 판단)
                    text_key = ctx['text'][:100]
                    if text_key not in seen_texts:
                        seen_texts.add(text_key)
                        all_contexts.append(ctx)
                        
            except Exception as e:
                continue  # 이미 _direct_search_rag에서 에러 로그 출력
        
        # 스코어 순으로 정렬하고 top-5만 선택
        all_contexts.sort(key=lambda x: x['score'], reverse=True)
        final_contexts = all_contexts[:RAG_CONFIG["top_k_results"]]
        
        print(f"✅ 총 {len(final_contexts)}개 고유 컨텍스트 병합 완료")
        return final_contexts
    
    def _build_differentiation_context(self, lecture_info: Dict) -> str:
        """강의 차별화 컨텍스트 생성"""
        lecture_number = lecture_info['number']
        focus_keywords = lecture_info.get('focus_keywords', [])
        main_apis = lecture_info.get('main_apis', [])
        avoid_topics = lecture_info.get('avoid_topics', [])
        
        # 이전 강의들 분석
        all_lectures = self.curriculum_manager.get_lecture_series()
        previous_lectures = [lec for lec in all_lectures if lec['number'] < lecture_number]
        next_lectures = [lec for lec in all_lectures if lec['number'] > lecture_number]
        
        context = f"""
==== 강의 차별화 가이드 ====
이 강의는 UniTask 시리즈의 {lecture_number}강으로, 다른 강의들과 명확히 구분되어야 합니다.

**이 강의의 고유 포커스:**
- 핵심 키워드: {', '.join(focus_keywords)}
- 주요 API: {', '.join(main_apis)}
- 강의 특화 주제: {lecture_info['title']}

**절대 포함하지 말아야 할 내용:**
{chr(10).join([f"- {topic}" for topic in avoid_topics])}

**이전 강의들에서 이미 다룬 내용 (중복 금지):**
{chr(10).join([f"- {lec['number']}강: {lec['title']} - {lec.get('description', '')}" for lec in previous_lectures[-2:]])}

**다음 강의 예고 (간단히만 언급):**
{chr(10).join([f"- {lec['number']}강: {lec['title']}" for lec in next_lectures[:2]])}

**이 강의만의 독특한 관점:**
- {lecture_info['title']}에 완전히 특화된 실무 예제
- {focus_keywords[0] if focus_keywords else '해당 주제'}의 심화 활용 패턴
- 실제 게임 개발에서의 {focus_keywords[1] if len(focus_keywords) > 1 else '관련'} 활용 사례
=======================================
"""
        return context
    
    def _build_lecture_prompt(self, lecture_info: Dict, rag_contexts: List[Dict], keywords: List[str]) -> str:
        """강의 생성 프롬프트 구성"""
        
        # RAG 컨텍스트를 문자열로 변환
        context_text = "\n\n".join([
            f"=== {ctx['file_path']} (유사도: {ctx['score']:.3f}) ===\n{ctx['text']}"
            for ctx in rag_contexts
        ])
        
        # 차별화 컨텍스트 생성
        differentiation_context = self._build_differentiation_context(lecture_info)
        
        prompt = f"""당신은 UniTask 전문가이자 기술 강의 작성자입니다.

아래 품질 기준 예시와 정확히 동일한 수준, 구조, 깊이, 스타일로 UniTask 강의를 작성하세요.

{differentiation_context}

==== 품질 기준 예시 (이 수준을 반드시 유지하세요) ====
{self.quality_template}
===============================================

==== RAG 컨텍스트 (UniTask 공식 자료) ====
{context_text}
===============================================

==== 강의 정보 ====
- 강의 번호: {lecture_info['number']}강
- 강의 제목: {lecture_info['title']}
- 강의 설명: {lecture_info['description']}
- 주요 키워드: {', '.join(keywords)}
===============================================

**중요 요구사항:**
1. 위 품질 기준 예시의 모든 특징을 정확히 유지하세요
   - 동일한 섹션 구조 (학습 내용, 실제 개발 문제 상황, 단계별 해결 과정, 실습 과제, 자주 하는 실수, 모범 사례, 요약)
   - 3000-4000단어 분량
   - 실무 중심의 게임 개발 시나리오
   - 완전하고 실행 가능한 코드 예제 5개 이상
   - 실습 과제 2개 이상

2. RAG 컨텍스트의 정보를 정확히 활용하세요
   - 공식 API와 메서드 사용법
   - 실제 코드 구현 패턴
   - 공식 문서의 설명

3. 실무 중심으로 작성하세요
   - Unity 게임 개발 실제 상황
   - 단계별 문제 해결 과정
   - 초보자도 이해할 수 있는 설명

4. 마크다운 형식으로 작성하세요

강의를 작성해주세요:"""

        return prompt
    
    def generate_lecture(self, lecture_number: int) -> str:
        """개별 강의 생성"""
        print(f"📝 {lecture_number}강 생성 시작...")
        
        # 커리큘럼에서 강의 정보 가져오기
        lecture_info = self.curriculum_manager.get_lecture_info(lecture_number)
        if not lecture_info:
            raise ValueError(f"{lecture_number}강 정보를 찾을 수 없습니다.")
        
        print(f"📚 강의 제목: {lecture_info['title']}")
        
        # RAG 검색 쿼리 개선 - 여러 키워드별 개별 검색
        focus_keywords = lecture_info.get('focus_keywords', [])
        main_apis = lecture_info.get('main_apis', [])
        
        if not focus_keywords:
            # 백워드 호환성: description에서 키워드 추출
            focus_keywords = lecture_info.get('description', '').split(', ')
        
        # 여러 검색 쿼리 생성
        search_queries = []
        
        # 1. 제목 + 핵심 키워드
        search_queries.append(f"{lecture_info['title']} {' '.join(focus_keywords[:3])}")
        
        # 2. 각 API별 개별 검색
        for api in main_apis[:2]:  # 상위 2개 API만
            search_queries.append(f"{api} usage example documentation")
        
        # 3. 키워드 조합 검색
        if len(focus_keywords) >= 2:
            search_queries.append(f"{focus_keywords[0]} {focus_keywords[1]} Unity implementation")
        
        # RAG 컨텍스트 검색 - 여러 쿼리로 검색 후 병합
        rag_contexts = self.search_multiple_queries(search_queries)
        
        # 프롬프트 구성
        prompt = self._build_lecture_prompt(lecture_info, rag_contexts, focus_keywords)
        
        # GPT-4o API 호출
        print("🤖 GPT-4o 강의 생성 중...")
        try:
            response = self.openai_client.chat.completions.create(
                model=GENERATION_CONFIG["model"],
                messages=[
                    {
                        "role": "system", 
                        "content": "당신은 UniTask 전문가이자 고품질 기술 강의 작성자입니다. 주어진 품질 기준을 정확히 따라 깊이 있는 강의를 작성합니다."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=GENERATION_CONFIG["temperature"],
                max_tokens=GENERATION_CONFIG["max_tokens"]
            )
            
            lecture_content = response.choices[0].message.content
            print("✅ 강의 생성 완료")
            
            return lecture_content
            
        except Exception as e:
            print(f"❌ 강의 생성 실패: {e}")
            raise
    
    def save_lecture(self, lecture_number: int, content: str) -> str:
        """생성된 강의를 파일로 저장"""
        
        # 출력 디렉토리 확인/생성
        os.makedirs(self.paths["generated_dir"], exist_ok=True)
        
        # 파일명 생성
        lecture_info = self.curriculum_manager.get_lecture_info(lecture_number)
        safe_title = "".join(c for c in lecture_info['title'] if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_title = safe_title.replace(' ', '_').lower()
        
        filename = f"lecture_{lecture_number:02d}_{safe_title}.md"
        filepath = os.path.join(self.paths["generated_dir"], filename)
        
        # 헤더 추가
        header = f"""# {lecture_number}강. {lecture_info['title']}

> **강의 설명**: {lecture_info['description']}  
> **생성 일시**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

"""
        
        # 파일 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(header + content)
        
        print(f"💾 강의 저장 완료: {filename}")
        return filepath
    
    def generate_and_save_lecture(self, lecture_number: int) -> str:
        """강의 생성 및 저장 (통합 메서드)"""
        print("=" * 60)
        print(f"🚀 {self.subject.upper()} {lecture_number}강 생성 프로세스 시작")
        print("=" * 60)
        
        try:
            # 강의 생성
            content = self.generate_lecture(lecture_number)
            
            # 강의 저장
            filepath = self.save_lecture(lecture_number, content)
            
            print("=" * 60)
            print(f"🎉 {lecture_number}강 생성 및 저장 완료!")
            print(f"📁 저장 경로: {filepath}")
            print("=" * 60)
            
            return filepath
            
        except Exception as e:
            print("=" * 60)
            print(f"❌ {lecture_number}강 생성 실패: {e}")
            print("=" * 60)
            raise

def main():
    """테스트용 메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="개별 강의 생성 테스트")
    parser.add_argument("--subject", required=True, help="주제명 (예: unitask)")
    parser.add_argument("--lecture", type=int, required=True, help="강의 번호 (1-12)")
    
    args = parser.parse_args()
    
    # 강의 생성기 초기화
    generator = LectureGenerator(args.subject)
    
    # 개별 강의 생성 및 저장
    generator.generate_and_save_lecture(args.lecture)

if __name__ == "__main__":
    main()