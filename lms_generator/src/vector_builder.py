"""
RAG 벡터 데이터베이스 구축 모듈

UniTask 공식 Repository와 문서를 분석하여 Qdrant 벡터 DB에 저장
강의 생성 시 관련 컨텍스트를 검색할 수 있도록 함
"""

import os
import glob
import argparse
from typing import List, Dict, Tuple
from pathlib import Path

import openai
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

from config import (
    get_subject_paths, 
    get_qdrant_collection_name,
    RAG_CONFIG, 
    GENERATION_CONFIG,
    BASE_DIR
)

# 환경 변수 로드
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

class VectorBuilder:
    """벡터 데이터베이스 구축 클래스"""
    
    def __init__(self, subject: str):
        self.subject = subject
        self.collection_name = get_qdrant_collection_name(subject)
        self.paths = get_subject_paths(subject)
        self.data_path = self.paths["data_dir"]
        
        # OpenAI 클라이언트 초기화
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Qdrant 클라이언트 초기화
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_client = QdrantClient(url=qdrant_url)
        
        # 텍스트 분할기 초기화
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=RAG_CONFIG["chunk_size"],
            chunk_overlap=RAG_CONFIG["chunk_overlap"],
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
    def collect_source_files(self) -> List[Tuple[str, str]]:
        """소스 파일들을 수집합니다"""
        print(f"📁 데이터 경로에서 파일 수집 중: {self.data_path}")
        
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"데이터 경로가 존재하지 않습니다: {self.data_path}")
        
        # 지원하는 파일 확장자
        file_patterns = [
            "**/*.cs",      # C# 소스 코드
            "**/*.md",      # 마크다운 문서
            "**/*.txt",     # 텍스트 파일
            "**/*.json"     # JSON 설정 파일
        ]
        
        files_content = []
        
        for pattern in file_patterns:
            file_paths = glob.glob(os.path.join(self.data_path, pattern), recursive=True)
            
            for file_path in file_paths:
                # 제외할 파일들 (바이너리, 메타파일 등)
                if any(exclude in file_path.lower() for exclude in [
                    '.meta', '.dll', '.exe', '.bin', 'packages-lock.json'
                ]):
                    continue
                    
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                    # 빈 파일이나 너무 작은 파일 제외
                    if len(content.strip()) < 50:
                        continue
                        
                    # 상대 경로로 변환
                    relative_path = os.path.relpath(file_path, self.data_path)
                    files_content.append((relative_path, content))
                    
                except Exception as e:
                    print(f"⚠️  파일 읽기 실패: {file_path} - {e}")
                    continue
        
        print(f"✅ 총 {len(files_content)}개 파일 수집 완료")
        return files_content
    
    def create_chunks(self, files_content: List[Tuple[str, str]]) -> List[Dict]:
        """파일 내용을 청크로 분할합니다"""
        print("🔄 텍스트 청킹 작업 중...")
        
        all_chunks = []
        
        for file_path, content in files_content:
            # 텍스트 분할
            chunks = self.text_splitter.split_text(content)
            
            for i, chunk in enumerate(chunks):
                chunk_data = {
                    "id": f"{file_path}_{i}",
                    "text": chunk,
                    "metadata": {
                        "file_path": file_path,
                        "chunk_index": i,
                        "subject": self.subject,
                        "file_type": os.path.splitext(file_path)[1]
                    }
                }
                all_chunks.append(chunk_data)
        
        print(f"✅ 총 {len(all_chunks)}개 청크 생성 완료")
        return all_chunks
    
    def generate_embeddings(self, chunks: List[Dict]) -> List[Dict]:
        """텍스트 청크들을 임베딩으로 변환합니다"""
        print("🔄 임베딩 생성 중...")
        
        # 배치 단위로 처리 (API 한계 고려)
        batch_size = 100
        embedded_chunks = []
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            texts = [chunk["text"] for chunk in batch]
            
            try:
                # OpenAI Embedding API 호출
                response = self.openai_client.embeddings.create(
                    model=RAG_CONFIG["embedding_model"],
                    input=texts
                )
                
                # 응답에서 임베딩 추출
                embeddings = [data.embedding for data in response.data]
                
                # 청크에 임베딩 추가
                for j, chunk in enumerate(batch):
                    chunk["vector"] = embeddings[j]
                    embedded_chunks.append(chunk)
                
                print(f"✅ 배치 {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1} 완료")
                
            except Exception as e:
                print(f"❌ 임베딩 생성 실패 (배치 {i//batch_size + 1}): {e}")
                raise
        
        print(f"✅ 총 {len(embedded_chunks)}개 임베딩 생성 완료")
        return embedded_chunks
    
    def setup_qdrant_collection(self):
        """Qdrant 컬렉션을 설정합니다"""
        print(f"🔄 Qdrant 컬렉션 설정 중: {self.collection_name}")
        
        # 기존 컬렉션이 있으면 삭제
        try:
            self.qdrant_client.delete_collection(self.collection_name)
            print(f"🗑️  기존 컬렉션 삭제: {self.collection_name}")
        except:
            pass
        
        # 새 컬렉션 생성
        self.qdrant_client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=RAG_CONFIG["vector_dimension"],
                distance=Distance.COSINE
            )
        )
        
        print(f"✅ 컬렉션 생성 완료: {self.collection_name}")
    
    def store_vectors(self, embedded_chunks: List[Dict]):
        """벡터들을 Qdrant에 저장합니다"""
        print("🔄 벡터 저장 중...")
        
        # 포인트 구조 생성
        points = []
        for i, chunk in enumerate(embedded_chunks):
            point = PointStruct(
                id=i,
                vector=chunk["vector"],
                payload={
                    "text": chunk["text"],
                    "file_path": chunk["metadata"]["file_path"],
                    "chunk_index": chunk["metadata"]["chunk_index"],
                    "subject": chunk["metadata"]["subject"],
                    "file_type": chunk["metadata"]["file_type"]
                }
            )
            points.append(point)
        
        # 배치 단위로 저장
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            
            try:
                self.qdrant_client.upsert(
                    collection_name=self.collection_name,
                    points=batch
                )
                print(f"✅ 배치 {i//batch_size + 1}/{(len(points)-1)//batch_size + 1} 저장 완료")
                
            except Exception as e:
                print(f"❌ 벡터 저장 실패 (배치 {i//batch_size + 1}): {e}")
                raise
        
        print(f"✅ 총 {len(points)}개 벡터 저장 완료")
    
    def build_vector_db(self):
        """전체 벡터 데이터베이스 구축 프로세스"""
        print(f"🚀 {self.subject} 벡터 DB 구축 시작!")
        print("=" * 50)
        
        try:
            # 1. 소스 파일 수집
            files_content = self.collect_source_files()
            
            # 2. 텍스트 청킹
            chunks = self.create_chunks(files_content)
            
            # 3. 임베딩 생성
            embedded_chunks = self.generate_embeddings(chunks)
            
            # 4. Qdrant 컬렉션 설정
            self.setup_qdrant_collection()
            
            # 5. 벡터 저장
            self.store_vectors(embedded_chunks)
            
            print("=" * 50)
            print(f"🎉 {self.subject} 벡터 DB 구축 완료!")
            print(f"📊 컬렉션: {self.collection_name}")
            print(f"📊 벡터 개수: {len(embedded_chunks)}")
            
        except Exception as e:
            print(f"❌ 벡터 DB 구축 실패: {e}")
            raise

def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description="RAG 벡터 데이터베이스 구축")
    parser.add_argument("--subject", required=True, help="주제명 (예: unitask)")
    
    args = parser.parse_args()
    
    # 벡터 빌더 생성 및 실행
    builder = VectorBuilder(args.subject)
    builder.build_vector_db()

if __name__ == "__main__":
    main()