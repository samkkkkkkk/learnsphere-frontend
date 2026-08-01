# LearnSphere Frontend

> **AI가 생성한 맞춤형 학습 콘텐츠로 프로그래밍을 배우는 학습 플랫폼(LMS)의 프론트엔드**

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20.19.3-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

---

##  목차 (Table of Contents)

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 구성](#-시스템-구성)
- [시작하기 (설치 및 실행)](#-시작하기-설치-및-실행)
- [환경 변수](#-환경-변수)
- [디렉토리 구조](#-디렉토리-구조)
- [주요 페이지 및 라우트](#-주요-페이지-및-라우트)
- [AI 튜터 챗](#ai-튜터-챗)
- [코드 학습 가이드](./CODE_GUIDE.md) — 설계 의도와 코드 읽는 순서

---

##  프로젝트 소개

**LearnSphere**는 LLM 기반 콘텐츠 생성 파이프라인을 활용하여 프로그래밍 학습 자료(핵심 개념, 코드 예제, 퀴즈)를 자동으로 생성하고, 이를 학습자에게 수준별(초급/중급/고급)로 제공하는 학습 플랫폼입니다.

이 저장소는 LearnSphere의 **프론트엔드(React SPA)** 로, 다음을 목표로 개발되었습니다.

- 스스로 학습 커리큘럼을 설계하기 어려운 학습자에게 **체계적인 수준별 학습 경로** 제공
- AI가 생성한 레슨을 **가독성 높은 뷰어**(마크다운 렌더링 + 코드 하이라이팅)로 전달
- 학습 목표와 일정을 관리할 수 있는 **학습 매니저** 제공
- 운영자가 콘텐츠 생성·배포·롤백을 제어할 수 있는 **관리자 패널** 제공

---

##  주요 기능

### 1. 수준별 AI 레슨 뷰어 (`/react-learn`)
- 초급 / 중급 / 고급 레벨별 레슨 목록 조회
- 핵심 개념(마크다운), 코드 예제(신택스 하이라이팅), 퀴즈로 구성된 레슨 상세 보기
- React, UniTask 등 과목별 학습 자료 지원

### 2. 학습 매니저 (`/learning-manager`)
- 학습 목표 등록 (카테고리, 마감일, 일일 학습 시간 설정)
- 목표별 학습 일정(스케줄) 관리
- 집중 모드(Focus Manager) 모달을 통한 학습 몰입 지원

### 3. 관리자 패널 (`/admin`)
- **관리자 API 키 인증**: 키는 번들에 포함되지 않고 `sessionStorage`에만 보관되며, Axios 인터셉터가 관리자 엔드포인트 호출 시에만 `X-Admin-API-Key` 헤더를 자동 첨부
- 전체 콘텐츠 **일괄 생성 트리거** 및 생성 세대(Generation) 진행 현황/실패 토픽 조회
- 특정 생성 세대로 **레슨 일괄 전환(activate)**
- 레슨별 **버전 이력 조회 및 특정 버전으로 복원(rollback)**
- 백엔드 서버 헬스 체크

### 4. AI 튜터 챗 (전역 · 레슨 패널)
- 모든 페이지 우측 하단 플로팅 버튼으로 여는 **전역 튜터 챗** (세션 목록·새 대화·삭제)
- 레슨 상세의 **"이 레슨에 대해 질문하기"** 패널 — 해당 레슨 본문을 우선 근거로 답변
- 답변이 **토큰 단위로 스트리밍**(SSE)되며, 근거가 된 React 문서 제목을 출처로 표시
- 대화는 서버에 저장되어 새로고침·재접속 후에도 이어짐

### 5. 로그인 / 회원가입 (`/login`)
- 이메일·비밀번호 기반 가입과 로그인 (탭 하나로 전환)
- JWT 토큰은 `localStorage`에 보관되어 새로고침 후에도 세션 유지
- 토큰이 만료·위조로 거부되면(401) 자동 폐기 후 비로그인 상태로 복귀

### 6. 기타
- 학습 로드맵 페이지 (`/roadmap`) 및 메인 대시보드 (`/`)
- ID 기반 레슨 API로 백엔드 DB(PostgreSQL)와 연동
- 라이트/다크 테마 전환, 자가 채점 퀴즈(진도는 브라우저에 저장)

---

##  기술 스택

| 구분 | 기술 |
| --- | --- |
| **Language** | TypeScript 5.8 |
| **Framework / Library** | React 19, React Router DOM 7 |
| **Build Tool** | Vite 7 |
| **Styling** | 컴포넌트별 일반 CSS + CSS Modules (CSS 변수로 라이트/다크 테마) |
| **State** | Context API 3종 (Auth / ChatWidget / FocusManager) — 별도 상태 관리 라이브러리 없음 |
| **HTTP Client** | Axios (인터셉터로 관리자 키 / 학습자 JWT 자동 분기) + SSE는 네이티브 `fetch` |
| **Content Rendering** | react-markdown, remark-gfm, react-syntax-highlighter (지연 로드) |
| **Form** | react-hook-form (로그인/가입) |
| **Lint** | ESLint 9, typescript-eslint |
| **Infra** | Docker (node:20-alpine), Vite Dev Proxy |
| **Backend (별도 저장소/모듈)** | FastAPI, PostgreSQL, Qdrant, LangGraph 튜터, LLM 기반 콘텐츠 생성 파이프라인 |

> `styled-components` · `lodash` · `crypto-browserify`는 `package.json`에 남아 있으나 `src/`에서 import되지 않습니다 (2026-07-27 확인) — 정리 후보입니다.

---

##  시스템 구성

```
┌────────────────────┐        /api 프록시         ┌────────────────────┐
│  React SPA (Vite)  │  ───────────────────────▶  │  FastAPI Backend   │
│  localhost:5173    │  · /api/v1/lessons (공개)   │  localhost:8000    │
│                    │  · /api/v1/auth   (공개)    │                    │
│                    │  · /api/v1/chat   (JWT)     │                    │
│                    │  · /api/v1/admin  (키)      │                    │
│                    │  ◀── SSE 토큰 스트림 ────    │                    │
└────────────────────┘                            └─────────┬──────────┘
                                                            │
                                     ┌──────────────────────┼──────────────────┐
                          ┌──────────▼───────────┐  ┌───────▼────────┐  ┌──────▼──────┐
                          │ PostgreSQL           │  │ Qdrant         │  │ OpenAI      │
                          │ 레슨/버전/세대       │  │ React 문서     │  │ 생성·챗·    │
                          │ 유저/대화            │  │ 임베딩         │  │ 임베딩      │
                          └──────────────────────┘  └────────────────┘  └─────────────┘
```

- 개발 환경에서는 Vite Dev Server의 프록시가 `/api` 요청을 `http://127.0.0.1:8000` (FastAPI)로 전달합니다. **SSE 스트림도 이 프록시를 통과하며 버퍼링되지 않습니다.**
- 인증은 두 갈래입니다 — 관리자는 `X-Admin-API-Key`(sessionStorage), 학습자는 `Authorization: Bearer`(localStorage). Axios 인터셉터가 URL을 보고 자동으로 분기합니다.
- `lms_generator/` 디렉토리에는 학습 콘텐츠를 생성하는 Python 기반 생성기가 포함되어 있습니다.

---

##  시작하기 (설치 및 실행)

### 사전 요구 사항

- **Node.js `20.19.3` 이상** (`package.json`의 `engines` 필드 기준)
- **npm** (Node.js에 포함)
- (선택) **Docker** — 컨테이너 환경에서 실행할 경우
- (선택) **FastAPI 백엔드 서버** — 레슨 데이터 조회 등 API 기능을 사용하려면 `http://127.0.0.1:8000`에서 실행 중이어야 합니다.

###  저장소 클론

```bash
git clone https://github.com/<your-org>/learnsphere-frontend.git
cd learnsphere-frontend
```

###  의존성 설치

```bash
npm install
```

###  환경 변수 설정 (선택)

기본적으로 별도 설정 없이 동작하며, API 요청은 Vite 프록시를 통해 로컬 백엔드(`127.0.0.1:8000`)로 전달됩니다.
백엔드 주소를 직접 지정하려면 프로젝트 루트에 `.env` 파일을 생성하세요.

```bash
# .env
VITE_API_BASE_URL=http://your-backend-host:8000
```

###  개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 으로 접속합니다.
(`--host` 옵션이 기본 적용되어 같은 네트워크의 다른 기기에서도 접근할 수 있습니다.)

###  프로덕션 빌드 및 미리보기

```bash
# 타입 체크 + 프로덕션 빌드 (결과물: dist/)
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

###  Docker로 실행하기

```bash
# 이미지 빌드
docker build -t learnsphere-frontend .

# 컨테이너 실행 (개발 서버 모드, 5173 포트)
docker run -p 5173:5173 learnsphere-frontend
```

> 실제 배포 환경에서는 `docker-compose.yml`에서 command를 오버라이드하여 백엔드와 함께 구성하는 것을 권장합니다.

###  관리자 패널 사용

1. 백엔드 서버가 실행 중인지 확인합니다.
2. [http://localhost:5173/admin](http://localhost:5173/admin) 으로 접속합니다.
3. 백엔드에 설정된 **관리자 API 키**를 입력하면 콘텐츠 생성/버전 관리 기능이 활성화됩니다.
   (키는 브라우저 `sessionStorage`에만 저장되며 탭을 닫으면 삭제됩니다.)

---

##  환경 변수

| 변수명 | 필수 | 기본값 | 설명 |
| --- | :---: | --- | --- |
| `VITE_API_BASE_URL` | ❌ | `''` (상대 경로) | 백엔드 API의 Base URL. 미설정 시 Vite Dev Proxy(`/api` → `http://127.0.0.1:8000`)를 경유합니다. |

---

##  디렉토리 구조

```
learnsphere-frontend/
├── public/                      # 정적 리소스
├── src/
│   ├── api/
│   │   ├── axios.ts             # Axios 인스턴스 · 인증 인터셉터(관리자 키 / 학습자 토큰)
│   │   ├── lessonApi.ts         # 레슨/관리자 API 함수 및 타입 정의
│   │   ├── authApi.ts           # 가입 · 로그인 · 내 정보
│   │   └── chatApi.ts           # 튜터 챗 세션/메시지 + SSE 스트리밍(fetch)
│   ├── components/
│   │   ├── chat/                # 튜터 챗
│   │   │   ├── ChatWidget.tsx           # 전역 플로팅 챗 (세션 목록·새 대화·삭제)
│   │   │   ├── LessonChatPanel.tsx      # 레슨 상세 옆 질문 패널
│   │   │   ├── ChatMessages.tsx         # 메시지 렌더 (위젯·패널 공유)
│   │   │   ├── ChatComposer.tsx         # 입력창 (위젯·패널 공유)
│   │   │   ├── ChatLoginPrompt.tsx      # 비로그인 안내
│   │   │   └── useChatConversation.ts   # 대화 상태·전송·스트리밍 훅
│   │   ├── ui/                  # Button · Modal · Spinner · Toast · Skeleton 등
│   │   ├── MarkdownRenderer.tsx # 마크다운 렌더러 (지연 로드 파사드)
│   │   ├── MarkdownContent.tsx  # 실제 마크다운 구현 (lazy 대상)
│   │   ├── Quiz.tsx             # 자가 채점 퀴즈
│   │   ├── Header.tsx           # 공통 헤더 (내비게이션 + 로그인 상태)
│   │   ├── ThemeToggle.tsx      # 라이트/다크 전환
│   │   └── ErrorBoundary.tsx    # 렌더 오류 격리
│   ├── contexts/
│   │   ├── AuthContext.tsx      # 로그인 상태 · 토큰 복원
│   │   ├── ChatWidgetContext.tsx    # 챗 창 열림/닫힘
│   │   └── FocusManagerContext.tsx  # 집중 모드 전역 상태
│   ├── pages/
│   │   ├── MainPage.tsx         # 메인 대시보드
│   │   ├── RoadmapPage.tsx      # 학습 로드맵
│   │   ├── LearningManagerPage.tsx  # 학습 목표/일정 관리
│   │   ├── ReactLearnPage.tsx   # 수준별 레슨 뷰어
│   │   ├── LMSPage.tsx          # 과목별 콘텐츠 페이지
│   │   ├── AdminPanel.tsx       # 관리자 패널 (생성/버전 관리)
│   │   ├── LoginPage.tsx        # 로그인 · 회원가입
│   │   ├── FocusManagerModal.tsx    # 집중 모드 모달
│   │   ├── WireframePage.tsx    # 와이어프레임 미리보기
│   │   └── NotFoundPage.tsx     # 404
│   ├── App.tsx                  # Provider 중첩 · 라우트 정의
│   └── main.tsx                 # 엔트리 포인트
├── CODE_GUIDE.md                # 코드 학습 가이드 (설계 의도 중심)
├── lms_generator/               # LLM 기반 학습 콘텐츠 생성기 (Python)
├── Dockerfile                   # node:20-alpine 기반 이미지
├── vite.config.ts               # Dev 서버 · /api 프록시 설정
├── tsconfig*.json               # TypeScript 설정
└── package.json
```

> 코드를 읽고 고칠 계획이라면 [CODE_GUIDE.md](./CODE_GUIDE.md)를 보세요 — 인증 이원화, 챗 3층 구조, 스트리밍 처리 등 설계 의도를 코드 참조와 함께 설명합니다.

---

## 주요 페이지 및 라우트

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | MainPage | 메인 대시보드 및 과목 목록 |
| `/roadmap` | RoadmapPage | 학습 로드맵 |
| `/learning-manager` | LearningManagerPage | 학습 목표·일정 관리 |
| `/react-learn` | ReactLearnPage | 수준별 AI 레슨 뷰어 (+ 레슨 질문 패널) |
| `/lms` | LMSPage | 과목별 콘텐츠 (UniTask 등) |
| `/login` | LoginPage | 로그인 · 회원가입 (탭 전환) |
| `/admin` | AdminPanel | 콘텐츠 생성·세대 전환·버전 복원 (관리자 키 필요) |
| `/wireframe` | WireframePage | UI 와이어프레임 미리보기 |
| `*` | NotFoundPage | 404 |

> 라우트 가드는 없습니다. `/admin`도 열리지만 관리자 키가 없으면 API가 401을 반환합니다 — 접근 제어는 서버가 합니다.

---

## AI 튜터 챗

모든 페이지 우측 하단의 플로팅 버튼(💬)으로 열 수 있습니다. **로그인이 필요합니다.**

| 기능 | 설명 |
|---|---|
| 전역 챗 | 세션 목록·새 대화·삭제. 대화는 서버에 저장되어 새로고침해도 유지 |
| 레슨 질문 패널 | 레슨 상세에서 열면 그 레슨 본문을 우선 근거로 답변. 레슨별로 대화가 이어짐 |
| 스트리밍 | 답변이 토큰 단위로 도착 (SSE). 도중에 끊어도 받은 만큼 서버에 저장됨 |
| 출처 표시 | 답변 근거가 된 React 문서 제목을 함께 표시 |

인증 토큰은 `localStorage`(`learnsphere-token`)에 저장되며, 401 응답 시 자동 폐기됩니다.

---
