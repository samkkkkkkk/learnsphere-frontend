# LearnSphere Frontend — 코드 학습 가이드

> **이 문서의 목적**: 프론트엔드 코드를 처음 읽는 사람이 "어디에 무엇이 있고, 왜 그렇게 지었는지"를 이해하도록 돕는다.
>
> 다른 문서와의 관계:
> - [README.md](./README.md) — **실행 방법**과 기능 소개. 설치하고 띄울 때
> - 이 문서 — **설계 이해**. 코드를 읽고 고칠 때
> - [../learnsphere-api/CODE_GUIDE.md](../learnsphere-api/CODE_GUIDE.md) — 백엔드 짝 문서
>
> 기준 시점: 2026-07-27 (Phase 12 / M1 완료 시점)

---

## 1. 한눈에

React 19 + TypeScript 5.8 + Vite 7 SPA. **상태 관리 라이브러리가 없다** — Context API와 로컬 상태만 쓴다. 서버 통신은 axios 인스턴스 하나로 모으고, 스트리밍만 예외적으로 fetch를 쓴다.

| 구분 | 선택 | 왜 |
|---|---|---|
| 빌드 | Vite 7 | 빠른 HMR, `/api` dev 프록시 |
| 라우팅 | react-router-dom 7 | 라우트별 `lazy()` 코드 스플리팅 |
| 전역 상태 | **Context API 4개** | Redux/Zustand 불필요할 만큼 전역 상태가 적다 |
| 서버 통신 | axios + 인터셉터 | 인증 헤더를 한 곳에서 붙인다 |
| 폼 | react-hook-form | 로그인/가입에서만 사용 |
| 마크다운 | react-markdown + remark-gfm + react-syntax-highlighter | 지연 로드 |
| 스타일 | 순수 CSS (컴포넌트별 `.css`) | CSS 변수로 라이트/다크 테마 |
| 테스트 | **없음** | 수동 검증 시나리오로 대체 (기획 문서 참고) |

---

## 2. 디렉터리 구조

```
src/
├── main.tsx           엔트리 (BrowserRouter + App)
├── App.tsx            ★ Provider 중첩 + 라우트 정의 (58줄)
│
├── api/               ★ 서버 통신 계층
│   ├── axios.ts           인스턴스 · 인터셉터 · 토큰 저장소 (88줄)
│   ├── lessonApi.ts       레슨 조회 + 관리자 기능 + 타입 (158줄)
│   ├── authApi.ts         가입 · 로그인 · me (54줄)
│   └── chatApi.ts         세션 CRUD + 비스트리밍 + SSE 스트리밍 (171줄)
│
├── contexts/          ★ 전역 상태 (Provider + 커스텀 훅 패턴)
│   ├── AuthContext.tsx        user · login · signup · logout · 토큰 복원
│   ├── ChatWidgetContext.tsx  챗 창 열림/닫힘
│   └── FocusManagerContext.tsx 집중 모드
│
├── pages/             라우트 단위 화면
│   ├── MainPage.tsx           메인 대시보드
│   ├── RoadmapPage.tsx        학습 로드맵
│   ├── ReactLearnPage.tsx     ★ 레슨 뷰어 (400줄) — 이 앱의 중심
│   ├── LMSPage.tsx            UniTask 등 과목별 콘텐츠
│   ├── LearningManagerPage.tsx 학습 목표·일정 (615줄, 최대)
│   ├── AdminPanel.tsx         생성 트리거 · 세대 전환 · 버전 복원
│   ├── LoginPage.tsx          로그인/가입 (탭 하나로)
│   ├── FocusManagerModal.tsx  집중 모드 모달 (전역 렌더)
│   ├── WireframePage.tsx      UI 와이어프레임
│   └── NotFoundPage.tsx
│
└── components/
    ├── chat/              ★ 튜터 챗 (§6에서 상세)
    │   ├── ChatWidget.tsx         전역 플로팅 챗
    │   ├── LessonChatPanel.tsx    레슨 옆 사이드 패널
    │   ├── ChatMessages.tsx       메시지 렌더 (위젯·패널 공유)
    │   ├── ChatComposer.tsx       입력창 (위젯·패널 공유)
    │   ├── ChatLoginPrompt.tsx    비로그인 안내
    │   └── useChatConversation.ts ★ 챗의 두뇌 (222줄)
    │
    ├── ui/               Button · Modal · ConfirmModal · Spinner ·
    │                     Skeleton · Toast · Icon · Breadcrumb
    ├── MarkdownRenderer.tsx  지연 로드 파사드
    ├── MarkdownContent.tsx   실제 마크다운 렌더 (무거움)
    ├── Quiz.tsx              자가 채점 퀴즈
    ├── Header.tsx            내비 + 로그인 상태
    ├── ThemeToggle.tsx       라이트/다크
    └── ErrorBoundary.tsx     렌더 오류 격리
```

### 레이어 규칙

```
pages / components  ──▶  contexts (전역 상태)
        │
        └──────────▶  api/*.ts  ──▶  axios.ts  ──▶  백엔드
```

- **컴포넌트는 axios를 직접 쓰지 않는다.** 항상 `api/*.ts`의 함수를 거친다.
- **`api/*.ts`는 타입도 함께 내보낸다.** `LessonDetail`, `ChatMessage` 같은 서버 응답 타입이 여기 있고, 화면이 이를 import한다.
- **에러는 원본 그대로 던진다.** `api` 계층이 문구를 만들지 않고, 호출부가 상태 코드별로 분기한다 (`chatApi.ts:54` 주석 참고).

---

## 3. App.tsx — Provider 4중첩과 라우트

📖 **읽을 곳**: `App.tsx` (58줄). 앱 전체 구조가 이 한 파일에 있다.

```jsx
<AuthProvider>            ← 로그인 상태 (가장 바깥)
 <ToastProvider>          ← 알림
  <FocusManagerProvider>  ← 집중 모드
   <ChatWidgetProvider>   ← 챗 창 열림/닫힘
     <Header />
     <ErrorBoundary>
       <Suspense fallback={<Spinner />}>
         <Routes>...</Routes>
       </Suspense>
     </ErrorBoundary>
     <FocusManagerModal />   ← 라우트 밖. 어느 페이지에서든 뜬다
     <ChatWidget />          ← 라우트 밖. 어느 페이지에서든 뜬다
```

**중첩 순서에 이유가 있다.** `AuthProvider`가 가장 바깥인 것은 나머지가 로그인 상태에 의존하기 때문이다. `ChatWidget`은 `useAuth()`와 `useChatWidget()`을 둘 다 쓴다.

**`ChatWidget`과 `FocusManagerModal`이 `<Routes>` 밖에 있는 것**도 의도적이다. 라우트 안에 두면 페이지를 옮길 때마다 언마운트되어 대화 상태가 날아간다.

### 라우트 표

| 경로 | 페이지 | 인증 |
|---|---|---|
| `/` | MainPage | — |
| `/roadmap` | RoadmapPage | — |
| `/react-learn` | ReactLearnPage | — (챗 질문만 로그인 필요) |
| `/lms` | LMSPage | — |
| `/learning-manager` | LearningManagerPage | — |
| `/admin` | AdminPanel | 관리자 키 (화면에서 입력) |
| `/login` | LoginPage | — |
| `/wireframe` | WireframePage | — |
| `*` | NotFoundPage | — |

> 라우트 가드가 없다. `/admin`도 열리지만 관리자 키가 없으면 API가 401을 돌려준다. 보호는 서버가 한다.

### 코드 스플리팅

```jsx
const ReactLearnPage = lazy(() => import('./pages/ReactLearnPage'));
```

모든 페이지가 `lazy()`다. 빌드하면 페이지별 청크가 따로 나온다:

```
dist/assets/LoginPage-*.js          24 kB
dist/assets/MarkdownContent-*.js   228 kB   ← 가장 무겁다
dist/assets/index-*.js             288 kB   ← 공통 (App + Header + 챗 + 컨텍스트)
```

---

## 4. 핵심 설계 ① — api 계층과 인증 이원화

📖 **읽을 곳**: `api/axios.ts` (88줄). **이 파일이 프론트에서 가장 영리한 부분이다.**

### 요청 인터셉터가 인증을 갈라 붙인다

```ts
api.interceptors.request.use(config => {
  if (config.url?.includes('/admin/')) {
    config.headers['X-Admin-API-Key'] = getAdminApiKey();   // 관리자
    return config;
  }
  const token = getAuthToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;  // 학습자
  return config;
});
```

URL에 `/admin/`이 있으면 관리자 키, 아니면 학습자 토큰. **화면 코드는 인증을 전혀 신경 쓰지 않는다.**

### 저장 위치가 다른 이유

| | 저장소 | 키 | 왜 |
|---|---|---|---|
| 관리자 키 | `sessionStorage` | `learnsphere-admin-api-key` | 탭을 닫으면 사라진다. 번들에 포함되지 않는다 |
| 학습자 토큰 | `localStorage` | `learnsphere-token` | 탭을 닫아도 로그인이 유지된다 |

관리자 키는 강력하므로 수명을 짧게, 학습자 토큰은 편의를 위해 길게 — 위험도에 맞춘 선택이다.

### 응답 인터셉터가 만료 토큰을 정리한다

```ts
api.interceptors.response.use(r => r, error => {
  const isAdminCall = error.config?.url?.includes('/admin/');
  if (error.response?.status === 401 && !isAdminCall && getAuthToken()) {
    setAuthToken(null);
    onUnauthorized?.();     // ← AuthContext에 알린다
  }
  return Promise.reject(error);
});
```

`onUnauthorized`는 모듈 레벨 변수이고, `AuthContext`가 마운트될 때 `setUnauthorizedHandler()`로 자신을 등록한다. **순환 import 없이 api 계층이 Context에 신호를 보내는 방법**이다.

```
axios.ts  ──(콜백 호출)──▶  AuthContext
AuthContext ──(import)──▶ axios.ts
```

Context가 axios를 import하는 단방향은 유지하면서, 역방향 통신은 콜백 등록으로 푼다.

### 예외 하나 — SSE만 fetch를 쓴다

```ts
// chatApi.ts:71 streamMessage()
const response = await fetch(`.../stream`, {
  headers: { Authorization: `Bearer ${token}`, ... },
  body: JSON.stringify({ message }), signal,
});
```

axios를 못 쓰는 이유가 둘이다:

1. **`EventSource`는 Authorization 헤더를 붙일 수 없다** — SSE 표준 API가 헤더 지정을 지원하지 않는다
2. **axios(XHR)는 본문을 조각으로 읽을 수 없다** — 응답 전체가 도착해야 값을 준다

그래서 네이티브 `fetch` + `response.body.getReader()`를 쓴다. 대가로 **인터셉터가 안 걸린다** — 토큰을 직접 붙이고, 401 처리도 `notifyUnauthorized()`를 직접 호출한다 (`axios.ts:46-56`에 이를 위해 노출된 함수).

### SSE 라인 파싱의 함정

```ts
buffer += decoder.decode(value, { stream: true });
const lines = buffer.split('\n');
buffer = lines.pop() ?? '';        // ← 마지막 조각은 잘린 줄일 수 있다
for (const line of lines) handleLine(line.trimEnd());
```

네트워크 청크는 줄 경계에서 끊기지 않는다. `data: {"type":"tok` 까지만 도착할 수 있다. 그래서 **마지막 조각은 항상 버퍼에 남겨** 다음 청크와 이어 붙인다. `decode(..., {stream: true})`도 같은 이유 — 여러 바이트로 된 한글이 청크 경계에서 쪼개지는 것을 처리한다.

---

## 5. 핵심 설계 ② — Context 패턴

세 Context가 같은 모양이다. 하나를 이해하면 나머지도 같다.

```ts
// 1. Context 생성 (초기값 undefined)
const XContext = createContext<XContextType | undefined>(undefined);

// 2. 커스텀 훅 — Provider 밖 사용을 런타임에 잡는다
export const useX = () => {
  const context = useContext(XContext);
  if (context === undefined) throw new Error('useX must be used within an XProvider');
  return context;
};

// 3. Provider
export const XProvider = ({ children }) => { ... };
```

**`undefined` 초기값 + 훅에서 throw**가 핵심이다. 기본값을 주면 Provider를 빼먹어도 조용히 동작하다가 엉뚱한 곳에서 터진다. 이 패턴은 사용 즉시 명확한 에러를 낸다.

### AuthContext가 하는 세 가지

📖 **읽을 곳**: `contexts/AuthContext.tsx` (74줄)

```ts
// ① 401 핸들러 등록 (§4 참고)
useEffect(() => {
  setUnauthorizedHandler(() => setUser(null));
  return () => setUnauthorizedHandler(null);
}, []);

// ② 새로고침 시 저장된 토큰으로 세션 복원
useEffect(() => {
  if (!getAuthToken()) { setIsLoading(false); return; }
  authApi.fetchMe().then(setUser).catch(() => setAuthToken(null)).finally(...);
}, []);

// ③ login/signup — 토큰 저장 후 사용자 정보를 다시 받아온다
const login = async (email, password) => {
  setAuthToken(await authApi.login(email, password));
  setUser(await authApi.fetchMe());
};
```

**`isLoading`이 따로 있는 이유**: 새로고침 직후에는 "로그인 안 됨"과 "아직 확인 중"을 구분해야 한다. `Header`가 이걸 쓴다:

```jsx
{isLoading ? (
  <span className="nav-auth-placeholder" aria-hidden="true" />   // 자리만 차지
) : user ? (<>{user.nickname}님 <button>로그아웃</button></>)
  : (<NavLink to="/login">로그인</NavLink>)}
```

플레이스홀더가 없으면 "로그인" 링크가 잠깐 보였다가 닉네임으로 바뀌며 레이아웃이 흔들린다(CLS).

---

## 6. 핵심 설계 ③ — 챗 3층 구조

챗은 컴포넌트 6개 + 훅 1개로 되어 있다. 이 분리가 이 프로젝트에서 가장 배울 만한 구성이다.

```
┌─ ChatWidget.tsx ────────────┐   ┌─ LessonChatPanel.tsx ──┐
│  전역 플로팅 챗              │   │  레슨 옆 사이드 패널     │
│  · 세션 목록 · 새 대화 · 삭제 │   │  · lesson_id에 묶인 세션 │
└──────────┬──────────────────┘   └──────────┬─────────────┘
           │            둘이 공유             │
           ├──────────────┬───────────────────┤
           ▼              ▼                   ▼
   ChatMessages.tsx  ChatComposer.tsx  ChatLoginPrompt.tsx
   메시지 렌더        입력창            비로그인 안내
           │
           └──── 상태·통신은 전부 이 훅에 ────▶ useChatConversation.ts
```

**UI 컴포넌트는 렌더만 한다. 상태와 통신은 훅에 모여 있다.** 그래서 위젯과 패널이 겉모습만 다르고 로직은 100% 공유한다.

### 위젯과 패널의 차이는 "세션을 고르는 방법"뿐

| | ChatWidget | LessonChatPanel |
|---|---|---|
| 세션 선택 | 목록에서 사용자가 고름 (`lesson_id === null`인 것만) | 이 레슨의 세션을 찾고, 없으면 생성 |
| 언마운트 | **안 됨** (닫아도 마운트 유지) | 됨 (닫으면 사라짐) |
| 추가 기능 | 새 대화 · 삭제 · 목록 토글 | 없음 |

```ts
// LessonChatPanel.tsx:45 — 레슨 세션 찾기/만들기
const existing = sessions.find(session => session.lesson_id === lessonId);
const session = existing ?? (await chatApi.createSession(lessonId));
```

```ts
// ChatWidget.tsx:60 — 레슨에 묶인 세션은 전역 목록에서 제외
const general = loaded.find(session => session.lesson_id === null);
```

같은 `chat_sessions` 테이블을 `lesson_id`의 null 여부로 나눠 쓴다.

### useChatConversation — 챗의 두뇌

📖 **읽을 곳**: `components/chat/useChatConversation.ts` (222줄). **반드시 읽어야 할 파일.**

반환값:

```ts
{ messages, isSending, isLoading, error, streamingAnswer,
  send, retry, cancel, reload, canRetry }
```

담당하는 일 6가지:

**① 세션이 바뀌면 서버에서 메시지 로드**

```ts
useEffect(() => { ... fetchMessages(sessionId) ... }, [sessionId, reloadKey]);
```

`reloadKey`를 의존성에 넣어, `reload()`를 부르면 같은 세션이라도 다시 읽게 만든다.

**② 스트리밍 전송과 토큰 누적**

```ts
result = await chatApi.streamMessage(sessionId, question, {
  signal: controller.signal,
  onToken: token => { if (!stillShown()) return;
                      setStreamingAnswer(prev => (prev === null ? token : prev + token)); },
});
```

`streamingAnswer`는 **아직 메시지 목록에 들어가지 않은, 도착 중인 답변**이다. 완료되면 `messages`에 정식 항목으로 옮기고 `null`로 되돌린다.

**③ 폴백 — 언제 하고 언제 안 하는가 (중요)**

```ts
if (err instanceof StreamHttpError || err instanceof StreamAbortedError) {
  throw err;                          // ← 폴백하지 않는다
}
result = await chatApi.sendMessage(sessionId, question);   // ← 여기서만 폴백
```

**서버에 닿지도 못한 경우(네트워크 레벨 실패)에만** 비스트리밍으로 재시도한다. 이유:

> 스트림이 200으로 시작한 뒤 실패하면 서버가 **이미 질문을 저장했다.** 그때 폴백하면 같은 질문이 두 번 쌓인다.

**④ 취소와 배경 스트림 분리**

```ts
let detached = false;
const stillShown = () => {
  if (detached || controller.signal.aborted) return false;
  if (shownSessionRef.current !== askedSession) { detached = true; return false; }
  return true;
};
```

| 상황 | 동작 |
|---|---|
| 챗 창 닫기 | `cancel()` → `AbortController.abort()` → 스트림 중단. 서버는 받다 만 답변을 저장 |
| 세션 전환 | **끊지 않는다.** `detached=true`로 화면만 분리하고 서버는 끝까지 생성 |
| 화면 이탈(언마운트) | `abort()` |

세션 전환에서 끊지 않는 이유는 **끊으면 답변이 잘린 채 영구히 남기** 때문이다. 대신 배경 작업으로 두고, 스트림이 끝났을 때 마침 그 대화로 돌아와 있으면 `reload()`로 완성된 답변을 가져온다.

`detached`가 **한 번 서면 되돌아오지 않는** 것도 의도적이다. 중간부터 이어 그리면 앞부분이 빠진 답변이 되므로, 화면 복원은 서버에서 다시 읽는 방식으로만 한다.

**⑤ 상태 코드별 한국어 안내**

```ts
function messageForStatus(status) {
  if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  if (status === 403) return '접근할 수 없는 대화입니다.';
  if (status === 429) return '요청이 잠시 몰렸어요. 잠시 후 다시 시도해주세요.';
  if (status && status >= 500) return '서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
  return null;
}
```

`StreamHttpError`(fetch)와 `AxiosError`(axios) 둘 다 이 함수를 거친다.

**⑥ 재시도**

실패한 질문을 `failedQuestion`에 기억해 `retry()`로 재전송한다. 사용자 메시지는 이미 목록에 있으므로 다시 붙이지 않는다(`request(question, false)`).

### ChatMessages의 스트리밍 표현

```jsx
{streamingAnswer && (
  <div className="chat-message chat-message--assistant chat-message--streaming">
    <MarkdownRenderer>{streamingAnswer}</MarkdownRenderer>
    <span className="chat-cursor" aria-hidden="true" />
  </div>
)}
{showTypingDots && <div className="chat-typing"><i /><i /><i /></div>}
```

```ts
const showTypingDots = isSending && !streamingAnswer;
```

첫 토큰이 오기 전에는 점 세 개, 이후에는 글자가 그 자리를 대신한다.

스크롤도 갈라진다:

```ts
endRef.current?.scrollIntoView({ behavior: streamingAnswer ? 'auto' : 'smooth' });
```

토큰마다 부드러운 스크롤을 걸면 애니메이션이 따라가지 못해 흔들린다.

---

## 7. 핵심 설계 ④ — 마크다운 지연 로드

📖 **읽을 곳**: `components/MarkdownRenderer.tsx` (24줄)

```jsx
const MarkdownContent = React.lazy(() => import('./MarkdownContent'));

const MarkdownRenderer = ({ children }) => (
  <Suspense fallback={<div className="md-plain">{children}</div>}>
    <MarkdownContent>{children}</MarkdownContent>
  </Suspense>
);
```

react-markdown + Prism 하이라이터는 **228 kB**다. 그런데 전역 챗 위젯이 이걸 쓰므로, 직접 import하면 **모든 페이지의 초기 번들**에 들어간다.

그래서 얇은 파사드를 두고 실제 렌더러를 `lazy()`로 뺐다. 로드되는 짧은 순간에는 원문 텍스트를 그대로 보여주므로(`fallback`) 내용이 사라지지 않는다.

**같은 규칙을 세 곳이 공유한다**: 레슨 상세(ReactLearnPage) · LMS 강의 · 튜터 챗.

---

## 8. 레슨 뷰어 — ReactLearnPage

📖 **읽을 곳**: `pages/ReactLearnPage.tsx` (400줄)

앱의 중심 화면. 상태가 많지만 흐름은 단순하다.

```
fetchLessonIndex()    → { "초급": [{id, title, number}], "중급": [...], "고급": [...] }
    ↓ 레벨 선택 → 레슨 클릭
fetchLessonDetail(id) → { title, core_concepts, code_examples, quizzes, ... }
    ↓
MarkdownRenderer로 본문 렌더 + Quiz 컴포넌트 + LessonChatPanel
```

### 이어서 학습하기

```ts
const LAST_LESSON_KEY = 'learnsphere.lastLesson';

localStorage.setItem(LAST_LESSON_KEY, JSON.stringify({ level, lessonId }));
```

초기 레벨 결정 우선순위가 3단계다:

```ts
const initialLevel =
  (location.state as { level?: Level })?.level    // ① 로드맵에서 넘어온 레벨
  ?? lastLesson?.level                             // ② 마지막 학습 위치
  ?? '초급';                                        // ③ 기본값
```

`lessons.id`가 재생성 후에도 안정적이기 때문에(백엔드 §4.2) 이 북마크가 깨지지 않는다.

### 퀴즈 진도는 커스텀 이벤트로 전파

```ts
// Quiz.tsx — 진도 변경 시 발행
window.dispatchEvent(new Event(QUIZ_PROGRESS_EVENT));

// ReactLearnPage.tsx:55 — 구독해서 목록 뱃지 갱신
useEffect(() => {
  const onQuizUpdate = () => setQuizVersion(v => v + 1);
  window.addEventListener(QUIZ_PROGRESS_EVENT, onQuizUpdate);
  return () => window.removeEventListener(QUIZ_PROGRESS_EVENT, onQuizUpdate);
}, []);
```

퀴즈는 레슨 본문 안에, 완료 뱃지는 목록에 있어 서로 멀다. Context를 하나 더 만들 만큼 큰 상태는 아니라서 **DOM 커스텀 이벤트**로 느슨하게 연결했다. 진도 자체는 localStorage에 있다.

---

## 9. 클라이언트 저장소 정리

| 키 | 저장소 | 쓰는 곳 | 내용 |
|---|---|---|---|
| `learnsphere-token` | localStorage | `api/axios.ts` | 학습자 JWT |
| `learnsphere-admin-api-key` | **sessionStorage** | `api/axios.ts` | 관리자 키 |
| `learnsphere.theme` | localStorage | `ThemeToggle.tsx` | 라이트/다크 |
| `learnsphere.lastLesson` | localStorage | `ReactLearnPage.tsx` | 마지막 학습 위치 |
| (퀴즈 진도) | localStorage | `Quiz.tsx` | 레슨별 채점 결과 |
| (학습 목표) | localStorage | `LearningManagerPage.tsx` | 목표·일정 |

> **주의**: 퀴즈 진도와 학습 목표는 **서버에 저장되지 않는다.** 브라우저를 바꾸면 사라지고, 계정과 무관하다. 서버 저장이 필요해지면 별도 설계가 필요하다.

---

## 10. 학습 순서 제안

| 순서 | 파일 | 배울 것 | 분량 |
|---|---|---|---|
| 1 | `App.tsx` | 앱 전체 구조 · Provider 중첩 · 라우트 | 58줄 |
| 2 | `api/axios.ts` | ★ 인증 이원화 · 인터셉터 · 콜백 등록 | 88줄 |
| 3 | `contexts/AuthContext.tsx` | Context 패턴 · 세션 복원 · isLoading | 74줄 |
| 4 | `api/chatApi.ts` | ★ SSE 파싱 · 커스텀 에러 타입 | 171줄 |
| 5 | `components/chat/useChatConversation.ts` | ★ **스트리밍·취소·폴백** — 가장 정교함 | 222줄 |
| 6 | `components/chat/ChatMessages.tsx` | 렌더 전담 컴포넌트 · 스트리밍 표현 | 136줄 |
| 7 | `components/chat/ChatWidget.tsx` | 훅 사용 예시 · 세션 관리 | 218줄 |
| 8 | `pages/ReactLearnPage.tsx` | 실제 화면의 상태 흐름 | 400줄 |
| 9 | `pages/AdminPanel.tsx` | 관리자 기능 · 세대/버전 UI | 467줄 |

### 손으로 확인해보기

```bash
# 개발 서버 (백엔드가 8000에 떠 있어야 한다)
npm run dev

# 타입 체크 + 프로덕션 빌드 — 청크 분리 결과를 눈으로 확인
npm run build

# 번들에 무엇이 들어갔는지
ls -la dist/assets/
```

브라우저 DevTools에서 볼 것:

- **Application → Local Storage** — `learnsphere-token` 확인. 임의 문자열로 바꾸고 새로고침하면 401 → 자동 삭제되는지
- **Network → `stream` 요청 → Response** — SSE 이벤트가 한 줄씩 도착하는지
- **Network → 초기 로드** — 페이지별 청크가 따로 받아지는지

---

## 11. 알아둘 만한 흔적들

| 발견 | 설명 |
|---|---|
| `Header.tsx`의 주석 처리된 NavLink | 학습관리·와이어프레임·관리자 링크가 숨겨져 있다. URL 직접 입력으로는 접근 가능 |
| `src/components/MarkdownContent.tsx` | `MarkdownRenderer`가 `lazy()`로 부르는 실제 구현. 직접 import하면 안 된다 |
| `crypto-browserify` · `lodash` · `styled-components` | **`src/`에서 import 0건** (2026-07-27 확인). vite/tsconfig 참조도 없다 — 제거 후보 |
| `@types/axios` 의존성 | axios는 자체 타입을 포함한다. 이 스텁 패키지는 deprecated — 제거 후보 |
| `lms_generator/` | Python 기반 콘텐츠 생성기. 프론트 빌드와 무관 |
| 테스트 인프라 없음 | 프론트 전용 기능은 수동 검증 시나리오로 대체 ([../chat_bot_detail.md](../chat_bot_detail.md) 참고) |

---

## 관련 문서

- [README.md](./README.md) — 설치 · 실행 · 기능 소개 · 환경 변수
- [../learnsphere-api/CODE_GUIDE.md](../learnsphere-api/CODE_GUIDE.md) — 백엔드 학습 가이드 (짝 문서)
- [../learnsphere-api/ARCHITECTURE.md](../learnsphere-api/ARCHITECTURE.md) — API 명세 레퍼런스
- [../CONTENT_FLOW.md](../CONTENT_FLOW.md) — 콘텐츠 생성→프론트 전달 흐름
- [../chat_bot_detail.md](../chat_bot_detail.md) — 챗봇 Phase 계획과 수동 검증 시나리오
