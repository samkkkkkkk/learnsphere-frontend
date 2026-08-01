# 🎓 LMS 강의 생성 시스템

**기존 플랫폼에 통합되는 RAG 기반 AI 강의 자료 생성 모듈**

## 📋 프로젝트 개요

이 모듈은 기존 로드맵 플랫폼에 **독립적인 폴더로 추가**되어 공식 문서와 Repository를 RAG로 활용하여 우아한테크블로그 수준의 깊이 있는 강의 자료를 자동 생성합니다. 현재 UniTask를 대상으로 MVP를 구축하고 있으며, 기존 시스템을 전혀 건드리지 않고 작동합니다.

## 🎯 당신의 미션

**기존 플랫폼 내 `/lms_generator/` 폴더에서 UniTask 강의 생성 시스템을 구축하세요.**

### 위치 및 제약사항
- **작업 위치**: `/lms_generator/` 폴더 내에서만 작업
- **기존 시스템**: 절대 건드리지 말 것
- **UI 통합**: 나중에 처리 예정 (현재는 독립 실행)
- **데이터 관리**: 생성된 강의는 폴더 내에서 관리

### 입력 자료 (모두 `/lms_generator/` 내부)
- `examples/unitask_lecture_example.md` - 목표 품질 기준 (필수 참고)
- `subjects/unitask/curriculum.json` - 12강 커리큘럼 정의
- `subjects/unitask/data/Unitask/Repository/` - UniTask 공식 Repository 클론
- `subjects/unitask/data/Unitask/Docs/` - UniTask 공식 문서들
- `examples/react_props_tutorial.md` - 구조 참고용 템플릿

### 출력 목표
- `subjects/unitask/generated/courses/` 폴더에 강의 시리즈 저장
- 각 강의는 `unitask_lecture_example.md`와 동일한 품질과 구조
- 3000-4000단어 분량의 상세한 내용
- 실무 중심 예제와 실습 과제 포함
- **확장성**: 향후 React, Python 등 다른 주제도 동일한 구조로 추가 가능

## 🏗️ 시스템 아키텍처

```
📁 기존_플랫폼/
├── 📁 기존_코드들...
└── 📁 lms_generator/                 # 👈 여기서만 작업!
    ├── 📖 examples/
    │   ├── unitask_lecture_example.md    # 품질 기준 (핵심 참고)
    │   └── react_props_tutorial.md       # 구조 템플릿
    ├── 📁 subjects/                      # 주제별 관리
    │   └── 📁 unitask/                   # UniTask 전용 폴더
    │       ├── curriculum.json          # 12강 커리큘럼 정의
    │       ├── 📁 data/
    │       │   └── Unitask/
    │       │       ├── Repository/       # 공식 Repository 클론
    │       │       └── Docs/             # 공식 문서들
    │       └── 📁 generated/
    │           └── courses/              # 생성된 강의들 저장
    ├── 🔧 src/
    │   ├── vector_builder.py             # RAG 벡터 DB 구축
    │   ├── lecture_generator.py          # 강의 생성 엔진
    │   ├── curriculum_manager.py         # 커리큘럼 로딩 관리
    │   ├── config.py                     # 범용 설정 관리
    │   └── main.py                       # 메인 실행 파일
    ├── 📋 requirements.txt               # 의존성
    ├── ⚙️ .env                          # 환경 변수
    └── 📖 lms_readme.md                  # 이 파일
```

## 🚀 구현 단계

### Phase 1: RAG 시스템 구축
```python
# vector_builder.py 구현
def build_subject_vector_db(subject_name):
    """
    1. subjects/{subject_name}/data/ 폴더의 모든 소스 파일 읽기
    2. 해당 주제의 공식 문서들 읽기  
    3. 청크 단위로 분할 (1000-2000 토큰)
    4. OpenAI embedding으로 벡터화
    5. Qdrant에 저장 (컬렉션명: {subject_name}_lms)
    """
```

### Phase 2: 강의 생성 엔진
```python
# lecture_generator.py 구현
def generate_lecture(subject_name, lecture_info):
    """
    1. RAG에서 관련 컨텍스트 검색 (subject_name 기반)
    2. examples/{subject_name}_lecture_example.md 구조 분석
    3. curriculum.json에서 강의 정보 로드
    4. 동일한 품질/구조의 프롬프트 생성
    5. OpenAI API 호출
    6. subjects/{subject_name}/generated/courses/에 저장
    """
```

### Phase 3: 배치 생성 시스템
```python
# main.py 구현
def generate_course_series(subject_name):
    """
    주제별 전체 강의 시리즈 생성 (확장 가능한 구조)
    
    UniTask 예시:
    - curriculum.json에서 12강 커리큘럼 로드
    - 순차적으로 각 강의 생성 (Rate Limit 고려)
    - 진행률 표시 및 에러 처리
    - subjects/unitask/generated/courses/에 저장
    
    향후 React, Python 등도 동일한 방식으로 처리
    """
```

## 📏 품질 기준

### 필수 요구사항
- **분량**: 3000-4000단어 (unitask_lecture_example.md 수준)
- **구조**: 동일한 섹션 구성 유지
  - 학습 내용
  - 실제 개발 문제 상황
  - 단계별 해결 과정
  - 실습 과제
  - 자주 하는 실수
  - 모범 사례
  - 요약

### 내용 품질
- **실무 중심**: 실제 게임 개발 시나리오 활용
- **완전한 코드**: 실행 가능한 예제만 포함
- **단계별 설명**: 초보자도 이해할 수 있도록
- **에러 처리**: 실무에서 만날 수 있는 문제 상황 포함

## 🔧 기술 명세

### 독립 환경 설정
```bash
# lms_generator 폴더 내에서만 작업
cd lms_generator/

# 독립적인 환경 변수 관리
# .env 파일 (기존 시스템과 분리)
OPENAI_API_KEY=your_openai_key
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=unitask_lms
```

### 의존성 (독립 관리)
```python
# requirements.txt
openai>=1.0.0
qdrant-client>=1.6.0
langchain>=0.1.0
python-dotenv>=1.0.0
```

### RAG 설정
```python
# src/config.py
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')
EXAMPLES_DIR = os.path.join(BASE_DIR, '..', 'examples')
OUTPUT_DIR = os.path.join(BASE_DIR, '..', 'generated_courses')

RAG_CONFIG = {
    "chunk_size": 1500,
    "chunk_overlap": 200,
    "embedding_model": "text-embedding-3-small",
    "vector_dimension": 1536,
    "top_k_results": 5
}

GENERATION_CONFIG = {
    "model": "gpt-4o",
    "temperature": 0.7,
    "max_tokens": 4000
}
```

## 📝 프롬프트 템플릿

```python
# src/lecture_generator.py 내부
def load_quality_template():
    """examples/unitask_lecture_example.md 로드"""
    template_path = os.path.join(EXAMPLES_DIR, 'unitask_lecture_example.md')
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()

LECTURE_PROMPT = f"""
당신은 UniTask 전문가이자 기술 강의 작성자입니다.

다음 예시와 정확히 동일한 수준, 구조, 깊이로 UniTask 강의를 작성하세요:

==== 품질 기준 예시 ====
{load_quality_template()}
==========================

RAG 컨텍스트 (UniTask 공식 자료):
{rag_context}

강의 주제: {topic}
강의 번호: {lecture_number}

위 예시의 모든 특징을 유지하면서 주제에 맞는 강의를 작성하세요:
- 동일한 섹션 구조
- 3000-4000단어 분량  
- 실무 중심 예제
- 완전한 코드 포함
- 실습 과제 제공
"""
```

## 🎯 실행 방법

### 1. 독립 환경 설정
```bash
# lms_generator 폴더로 이동
cd lms_generator/

# 의존성 설치 (기존 시스템과 분리)
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일에 OpenAI API 키 설정
```

### 2. RAG DB 구축
```bash
# lms_generator 폴더에서 실행
python src/vector_builder.py --subject unitask
# subjects/unitask/data/ 폴더를 분석하여 벡터 DB 생성
```

### 3. 강의 생성
```bash
# lms_generator 폴더에서 실행
python src/main.py --subject unitask
# 전체 UniTask 강의 시리즈 생성 (12강)
# 결과: subjects/unitask/generated/courses/ 폴더에 저장
```

### 4. 생성된 강의 확인
```bash
# 생성된 강의들 확인
ls subjects/unitask/generated/courses/
# lecture_01_first_steps.md
# lecture_02_time_frame_control.md
# lecture_03_asyncoperation_mastery.md
# ... (총 12강)
```

## 📊 성공 지표

### 생성된 강의가 다음 조건을 만족해야 합니다:
- [ ] 3000단어 이상의 분량
- [ ] unitask_lecture_example.md와 동일한 구조
- [ ] 실행 가능한 코드 예제 5개 이상
- [ ] 실습 과제 2개 이상 포함
- [ ] 자주 하는 실수 3개 이상 포함
- [ ] 모범 사례 3개 이상 포함
- [ ] 실제 UniTask 공식 자료 기반 정확성

## 🚨 중요 주의사항

1. **독립성 유지**: `/lms_generator/` 폴더 외부는 절대 건드리지 말 것
2. **기존 시스템 보호**: 기존 플랫폼의 코드, DB, 설정 파일을 수정하지 말 것
3. **품질 우선**: 분량보다는 unitask_lecture_example.md 수준의 품질 유지
4. **정확성 확보**: RAG 컨텍스트 기반으로만 내용 작성, 잘못된 정보 금지
5. **구조 일관성**: 모든 강의가 동일한 구조와 스타일 유지
6. **실무 중심**: 이론보다는 실제 사용 사례 중심으로 작성

## 🔄 개발 프로세스

1. **Phase 1 완료 후**: RAG 시스템이 정상 작동하는지 확인
2. **Phase 2 완료 후**: 1개 강의 생성 테스트  
3. **Phase 3 완료 후**: 전체 시리즈 생성
4. **품질 검증**: 생성된 강의가 기준을 만족하는지 검토
5. **향후 통합**: UI 통합은 별도 작업으로 진행 예정

---

**💡 핵심 포인트**: 
- **독립성**: 기존 플랫폼을 건드리지 않고 `/lms_generator/` 폴더에서만 작업
- **확장성**: subjects/ 구조로 여러 주제 지원 (UniTask → React → Python ...)
- **품질 기준**: `examples/unitask_lecture_example.md`가 당신의 품질 기준
- **모듈화**: 각 주제별로 독립적인 데이터와 커리큘럼 관리