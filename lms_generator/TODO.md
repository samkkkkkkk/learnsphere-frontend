# LMS Generator 개발 진행 상황

## 📋 **현재까지 완료된 작업** ✅

### Phase 1: 프로젝트 기반 설정 (완료)
- [x] `requirements.txt` 생성 - Python 의존성 정의
- [x] `.env.example` 템플릿 생성 - 환경변수 가이드
- [x] 폴더 구조 개선 - `subjects/unitask/` 방식으로 확장 가능한 아키텍처 구축
- [x] `lms_readme.md` 새 구조에 맞춰 전면 수정

### 핵심 시스템 파일들 (완료)
- [x] `src/config.py` - 범용 설정 관리 (주제별 경로, Qdrant 컬렉션명 등)
- [x] `src/curriculum_manager.py` - 커리큘럼 로딩/검증/관리 클래스
- [x] `subjects/unitask/curriculum.json` - UniTask 12강 커리큘럼 정의

### UniTask 12강 커리큘럼 정의 (완료)
1. **기초 입문 (1-3강)**
   - 1강: UniTask 첫걸음 (예시 있음)
   - 2강: 시간과 프레임 제어
   - 3강: Unity AsyncOperation 완전 정복

2. **핵심 기능 (4-6강)**
   - 4강: 취소 시스템 마스터하기
   - 5강: 예외 처리와 안전한 코딩
   - 6강: 진행 상황과 피드백

3. **고급 기능 (7-9강)**
   - 7강: 병렬 처리의 기술
   - 8강: 커스텀 비동기 작업
   - 9강: async void vs UniTaskVoid

4. **실전 활용 (10-12강)**
   - 10강: AsyncEnumerable과 스트림
   - 11강: Unity 이벤트와 UI 연동
   - 12강: 디버깅과 성능 최적화

## 🚧 **다음에 해야할 작업** (우선순위 순)

### Phase 2: RAG 시스템 구축 (다음 작업)
- [ ] `src/vector_builder.py` 구현
  - subjects/{subject}/data/ 폴더 스캔
  - .cs, .md 파일 파싱
  - 청킹 (1500 토큰, 200 오버랩)
  - OpenAI embedding (text-embedding-3-small)
  - Qdrant 저장 (컬렉션명: {subject}_lms)

### Phase 3: 강의 생성 엔진
- [ ] `src/lecture_generator.py` 구현
  - RAG 검색 시스템
  - `examples/unitask_lecture_example.md` 품질 기준 로딩
  - curriculum.json에서 강의 정보 로딩
  - OpenAI API 호출 (gpt-4o, 4000 토큰)
  - subjects/{subject}/generated/courses/에 저장

### Phase 4: 배치 실행 시스템
- [ ] `src/main.py` 구현
  - CLI 인터페이스 (--subject 옵션)
  - 12강 순차 생성 (Rate Limit 고려)
  - 진행률 표시
  - 에러 처리 및 재시도 로직
  - 중간 저장

### Phase 5: 테스트 및 검증
- [ ] RAG 시스템 테스트
- [ ] 단일 강의 생성 테스트
- [ ] 전체 배치 실행 테스트
- [ ] 품질 검증 (3000-4000단어, 실행 가능한 코드 5개 이상 등)

## 🔧 **환경 설정 상태**

### 완료된 설정
- ✅ `.env` 파일 생성됨 (OpenAI API 키 설정됨)
- ✅ Qdrant Docker 실행 중 (localhost:6333)
- ✅ 기존 컬렉션 확인됨: `unitask-rag`, `unitask_full_docs`

### 필요한 설정
- [ ] `pip install -r requirements.txt` 실행 필요
- [ ] 의존성 설치 후 config 검증: `python3 -c "from src.config import validate_config; validate_config('unitask')"`

## 📁 **현재 폴더 구조**

```
📁 lms_generator/
├── 📖 examples/
│   ├── unitask_lecture_example.md    # 품질 기준 (완료)
│   └── react_props_tutorial.md       # 구조 템플릿
├── 📁 subjects/                      # 주제별 관리 (신규)
│   └── 📁 unitask/                   # UniTask 전용
│       ├── curriculum.json          # 12강 커리큘럼 (완료)
│       ├── 📁 data/Unitask/         # 데이터 (사용자가 클론함)
│       └── 📁 generated/courses/     # 생성될 강의들
├── 🔧 src/
│   ├── config.py                     # 범용 설정 (완료)
│   ├── curriculum_manager.py         # 커리큘럼 관리 (완료)
│   ├── vector_builder.py             # TODO: RAG 벡터 DB 구축
│   ├── lecture_generator.py          # TODO: 강의 생성 엔진
│   └── main.py                       # TODO: 메인 실행 파일
├── 📋 requirements.txt               # 의존성 (완료)
├── ⚙️ .env                          # 환경 변수 (완료)
├── 📖 lms_readme.md                  # 문서 (완료)
└── 📝 TODO.md                       # 이 파일
```

## 🎯 **주요 기술 명세**

### RAG 설정
- **청크 크기**: 1500 토큰, 200 오버랩
- **임베딩**: text-embedding-3-small (1536차원)
- **검색**: top-k=5

### 생성 설정
- **모델**: gpt-4o
- **온도**: 0.7
- **최대 토큰**: 4000

### 품질 기준
- **분량**: 3000-4000단어
- **구조**: unitask_lecture_example.md와 동일
- **코드**: 실행 가능한 예제 5개 이상
- **실습**: 과제 2개 이상

## 🚀 **실행 명령어 (개발 완료 후)**

```bash
# 1. 의존성 설치
pip install -r requirements.txt

# 2. RAG DB 구축
python src/vector_builder.py --subject unitask

# 3. 전체 강의 생성
python src/main.py --subject unitask

# 4. 결과 확인
ls subjects/unitask/generated/courses/
```

## 💡 **중요 포인트**

### 확장성
- **subjects/** 구조로 여러 주제 지원 (UniTask → React → Python ...)
- **curriculum.json**으로 주제별 커리큘럼 독립 관리
- **주제별 Qdrant 컬렉션** ({subject}_lms)

### 제약사항
- **API 한계**: 한 번에 1강씩만 생성 가능 (4000 토큰 제한)
- **Rate Limit**: 연속 호출 시 10초 대기 필요
- **기존 시스템**: `/lms_generator/` 외부 절대 접근 금지

### 품질 관리
- **템플릿 기반**: unitask_lecture_example.md 품질 기준 준수
- **RAG 활용**: 공식 문서와 Repository 기반 정확성 확보
- **검증 시스템**: curriculum_manager의 유효성 검사 활용

---

**다음 재개 시**: `src/vector_builder.py` 구현부터 시작!