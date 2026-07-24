# LearnSphere Frontend

> **AI가 생성한 맞춤형 학습 콘텐츠로 프로그래밍을 배우는 학습 플랫폼(LMS)의 프론트엔드**

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Node.js-20.19.3-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
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

### 4. 기타
- 학습 로드맵 페이지 (`/roadmap`) 및 메인 대시보드 (`/`)
- ID 기반 레슨 API로 백엔드 DB(PostgreSQL)와 연동

---

##  기술 스택

| 구분 | 기술 |
| --- | --- |
| **Language** | TypeScript 5.8 |
| **Framework / Library** | React 19, React Router DOM 7 |
| **Build Tool** | Vite 7 |
| **Styling** | styled-components, CSS Modules, 일반 CSS |
| **HTTP Client** | Axios (요청 인터셉터 기반 관리자 인증) |
| **Content Rendering** | react-markdown, remark-gfm, react-syntax-highlighter |
| **Form** | react-hook-form |
| **Lint** | ESLint 9, typescript-eslint |
| **Infra** | Docker (node:20-alpine), Vite Dev Proxy |
| **Backend (별도 저장소/모듈)** | FastAPI, PostgreSQL, LLM 기반 콘텐츠 생성기(`lms_generator`) |

---

##  시스템 구성

```
┌────────────────────┐        /api 프록시         ┌────────────────────┐
│  React SPA (Vite)  │  ───────────────────────▶  │  FastAPI Backend   │
│  localhost:5173    │   /api/v1/lessons 등        │  localhost:8000    │
└────────────────────┘                            └─────────┬──────────┘
                                                            │
                                              ┌─────────────▼──────────────┐
                                              │  PostgreSQL (레슨/버전/세대) │
                                              │  + LLM 콘텐츠 생성 파이프라인 │
                                              └────────────────────────────┘
```

- 개발 환경에서는 Vite Dev Server의 프록시가 `/api` 요청을 `http://127.0.0.1:8000` (FastAPI)로 전달합니다.
- `lms_generator/` 디렉토리에는 학습 콘텐츠를 생성하는 Python 기반 생성기가 포함되어 있습니다.

---

##  시작하기 (설치 및 실행)

### 사전 요구 사항

- **Node.js `20.19.3`** (`package.json`의 `engines` 필드 기준 — [nvm](https://github.com/nvm-sh/nvm) 또는 [nvm-windows](https://github.com/coreybutler/nvm-windows) 사용 권장)
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
│   │   ├── axios.ts             # Axios 인스턴스 · 관리자 키 인터셉터
│   │   └── lessonApi.ts         # 레슨/관리자 API 함수 및 타입 정의
│   ├── components/
│   │   └── Header.tsx           # 공통 헤더 (내비게이션)
│   ├── contexts/
│   │   └── FocusManagerContext.tsx  # 집중 모드 전역 상태
│   ├── pages/
│   │   ├── MainPage.tsx         # 메인 대시보드
│   │   ├── RoadmapPage.tsx      # 학습 로드맵
│   │   ├── LearningManagerPage.tsx  # 학습 목표/일정 관리
│   │   ├── ReactLearnPage.tsx   # 수준별 레슨 뷰어
│   │   ├── LMSPage.tsx          # 과목별 콘텐츠 페이지
│   │   ├── AdminPanel.tsx       # 관리자 패널 (생성/버전 관리)
│   │   ├── FocusManagerModal.tsx    # 집중 모드 모달
│   │   └── WireframePage.tsx    # 와이어프레임 미리보기
│   ├── App.tsx                  # 라우트 정의
│   └── main.tsx                 # 엔트리 포인트
├── lms_generator/               # LLM 기반 학습 콘텐츠 생성기 (Python)
├── Dockerfile                   # node:20-alpine 기반 이미지
├── vite.config.ts               # Dev 서버 · /api 프록시 설정
├── tsconfig*.json               # TypeScript 설정
└── package.json
```

---

## 주요 페이지 및 라우트

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | MainPage | 메인 대시보드 및 과목 목록 |
| `/roadmap` | RoadmapPage | 학습 로드맵 |
| `/learning-manager` | LearningManagerPage | 학습 목표·일정 관리 |
| `/react-learn` | ReactLearnPage | 수준별 AI 레슨 뷰어 |
| `/admin` | AdminPanel | 콘텐츠 생성·세대 전환·버전 복원 (관리자 키 필요) |
| `/wireframe` | WireframePage | UI 와이어프레임 미리보기 |

---
