# LearnSphere UI/UX 개선 실행 계획 (Phase별)

> 기반 문서: [`docs/ui-ux-checklist.md`](./ui-ux-checklist.md) — 아래 각 작업의 `#번호`는 체크리스트 항목 번호.
> 작성일: 2026-07-27

## 진행 원칙 (합의 사항)

| 항목 | 결정 |
|---|---|
| 범위 | **프론트 단독으로 가능한 것 우선.** 백엔드 API 변경이 필요한 항목은 🔗 표시 후 후반 Phase로 분리 |
| Phase 크기 | **반나절~1일 단위** (Phase당 커밋 1~2개), 단순한 것 → 복잡한 것 순서로 진행 |
| 디자인 | **기존 원목·종이 테마를 유지하지 않고 새 디자인 도입.** Phase 0에서 **시안 B — 다크 개발자 무드** 선택 확정 (에디터 다크 `#0D1017` + 앰버 `#FFB454`, Pretendard + JetBrains Mono, `docs/design-drafts/draft-b-dark-dev.html` 기준) |
| 공용 컴포넌트 | 순수 CSS 방식 유지, Toast/Modal/Button **자체 구현** (라이브러리 미도입) |
| 기능 우선순위 | ① 챗봇 UX → ② 로드맵→레슨 연결 → ③ 퀴즈 인터랙션. RAG 근거 강화는 🔗 후순위 |
| 숨긴 페이지 | 학습관리·와이어프레임·관리자 **전부 코드 유지** (이번 계획에서 삭제하지 않음) |
| 모바일 | **핵심 화면(챗 위젯·로그인·메인·헤더)만 우선**, 로드맵 등은 후순위 |
| 다크모드 | **토큰 구조만 다크모드 대응 가능하게 설계**, 실제 토글 구현은 후순위(Phase 14) |
| 검증 | 각 Phase 완료 시 `npm run build` 통과 + dev 서버에서 해당 화면 브라우저 수동 확인 |

---

## Phase 0 — 디자인 시안 3종 제작 및 선택 🎨

**목표**: 새 디자인 방향을 코드 작업 전에 확정한다.

- [x] 대표 화면(메인 히어로 + 레슨 카드 + 챗 패널)을 담은 **독립 정적 HTML 목업 3종** 제작 (실제 앱 코드는 건드리지 않음, `docs/design-drafts/`에 저장)
  - **시안 A — 모던 미니멀**: 뉴트럴 배경 + 포인트 컬러 1개, Pretendard, 리니어·노션 감성
  - **시안 B — 다크 개발자 무드**: IDE·터미널 감성의 다크 베이스 + 네온 포인트, 코드 학습 콘텐츠와 조화
  - **시안 C — 소프트 러닝** (제안): 밝은 배경 + 따뜻한 파스텔 포인트 + 큰 라운드, 학습 동기부여·친근함 강조
- [x] 각 시안에 색상 팔레트·폰트·버튼/카드/코드블록 스타일 샘플 포함
- [x] **사용자 선택 → 선택안을 이후 모든 Phase의 디자인 기준으로 확정**

**검증**: 브라우저에서 3종 HTML 열어 비교 → **시안 B(다크 개발자 무드) 선택 완료** (2026-07-27).
**확정 토큰 기준**: bg `#0D1017` / surface `#131721` / card `#161B26` / line `#232A3A` / ink `#E2E4EA` / sub `#9AA1B3` / accent(amber) `#FFB454` / blue `#59C2FF` / green `#AAD94C` / purple `#D2A6FF` / red `#F07178`, 폰트 Pretendard + JetBrains Mono.

---

## Phase 1 — 기초 정리 (가장 단순한 것부터)

**목표**: 코드 5분 수정으로 끝나는 신뢰성 문제부터 제거한다.

- [x] #31 `index.html` 타이틀 "Vite + React + TS" → "LearnSphere", 파비콘 교체(`public/favicon.svg`, 시안 B 무드), meta description 추가
- [x] #37 `<html lang="en">` → `lang="ko"`
- [x] #24 `MainPage.css`의 전역 `body` 재정의 제거, `.header`/`.logo` 블록은 MainPage에서 미사용 죽은 코드여서 삭제
- [x] #63 Font Awesome CSS `@import` → `index.html` `<link>` + preconnect로 이동
- [x] 빈 `App.css` 삭제 (import 참조 없음 확인)

**대상**: `index.html`, `src/pages/MainPage.css`, `src/App.css`
**검증**: 빌드 통과, 탭 타이틀·파비콘 확인, 페이지 이동 시 폰트가 바뀌지 않는지 확인.

---

## Phase 2 — 디자인 토큰 구축 (선택 시안 기반)

**목표**: 선택된 시안의 색·타이포·간격을 CSS 변수 체계로 옮겨 이후 Phase의 기반을 만든다.

- [ ] #18 색상 토큰: 기존 원목·종이 변수 제거, 새 시안 팔레트로 `:root` 재정의 — **다크모드 대비 시맨틱 네이밍**(`--color-bg`, `--color-surface`, `--color-text` 등)으로 설계
- [ ] #19 간격 토큰: `--space-1`~`--space-10` (4px 스케일)
- [ ] #20~22 타이포 토큰 + 웹폰트: 시안에서 확정한 폰트(예: Pretendard) 로드, `--font-sans`/`--text-sm`~`--text-3xl`/행간 스케일 정의, 파일별 폰트 스택 4종 제거
- [ ] #23 radius·shadow·z-index 토큰 (`--z-header`/`--z-modal`/`--z-chat` 등)
- [ ] 공통 브레이크포인트 값 결정 및 문서화 (#68 대비)

**대상**: `src/index.css` (토큰 중앙화), `index.html` (폰트 로드)
**검증**: 빌드 통과. 이 시점에는 화면이 아직 새 테마로 안 바뀌어도 됨(토큰 준비 단계).

---

## Phase 3 — 공용 컴포넌트 1차: Button · 로딩

**목표**: 가장 많이 쓰이는 요소부터 새 테마로 컴포넌트화한다.

- [ ] #25 `src/components/ui/Button.tsx` — primary/secondary/ghost/danger 변형, hover·active·disabled 상태(#56), 로딩 상태(#57)
- [ ] #64 `src/components/ui/Spinner.tsx` — 진짜 애니메이션 스피너 (현재 텍스트뿐인 `loading-spinner` 대체)
- [ ] #65 `src/components/ui/Skeleton.tsx` — 카드/텍스트용 기본 스켈레톤
- [ ] 로딩 텍스트 5종 혼재 지점(ReactLearnPage, LMSPage, Chat)을 Spinner/Skeleton으로 교체

**대상**: 신규 `src/components/ui/`, `ReactLearnPage.tsx`, `LMSPage.tsx`
**검증**: 각 화면 로딩 상태를 브라우저에서 확인(네트워크 스로틀링 활용).

---

## Phase 4 — 공용 컴포넌트 2차: Modal · Toast

**목표**: `alert()`/`confirm()`을 없애고 접근성 갖춘 오버레이 체계를 만든다.

- [ ] #25/#33 `src/components/ui/Modal.tsx` — Esc 닫기, 포커스 트랩, `role="dialog"`/`aria-modal`, 오버레이 클릭 닫기
- [ ] #49 `src/components/ui/Toast.tsx` + `ToastContext` — 성공/오류/안내 3종
- [ ] 기존 모달 3벌(레슨 크게보기, 기술스택 신청, FocusManager)을 공용 Modal로 교체
- [ ] #49/#60 `alert()`(`LMSPage.tsx:107,253`) → Toast, `confirm()`(`AdminPanel.tsx:140`) → 확인 Modal
- [ ] #52 챗 세션 삭제에 확인 절차 추가

**대상**: 신규 `src/components/ui/`, `LMSPage.tsx`, `ReactLearnPage.tsx`, `AdminPanel.tsx`, `FocusManagerModal.tsx`, `ChatWidget.tsx`
**검증**: 모달 Esc/탭 이동 동작, 신청·삭제 시 Toast 노출 확인.

---

## Phase 5 — 새 테마 적용 ①: Header · MainPage

**목표**: 진입 화면부터 새 디자인으로 전환한다.

- [ ] Header 새 테마 리스킨 + #30 인라인 스타일 13줄 CSS 이동
- [ ] #2 `Link` → `NavLink` 전환으로 active 메뉴 하이라이트 동작
- [ ] #66 인증 확인 중 auth 영역 placeholder 유지 (CLS 제거)
- [ ] #38 Header 로고 `<h1>` → `<div>`/`<span>`으로 변경 (페이지별 h1 확보)
- [ ] MainPage 새 테마 리스킨 (히어로·feature 카드·주제 그리드)
- [ ] #74 모바일 헤더 정리 (핵심 화면 우선 방침)

**대상**: `Header.tsx/css`, `MainPage.tsx/css`
**검증**: 메뉴 이동 시 active 표시, 새로고침 시 헤더 흔들림 없음, 모바일 뷰 확인.

---

## Phase 6 — 새 테마 적용 ②: 로그인 · 챗 위젯 (구 보라 테마 제거)

**목표**: 구 테마가 가장 심하게 남은 화면을 새 디자인으로 통일한다. (#17 완료 지점)

- [ ] `LoginPage.css` 새 테마 리스킨 + #71 모바일 미디어쿼리 추가
- [ ] `ChatWidget.css`·`LessonChatPanel.css` 새 테마 리스킨 (보라 #5b21b6 전부 제거)
- [ ] #69 챗 위젯 모바일 대응 — 좁은 화면에서 전체 화면 시트로 전환
- [ ] #72 FAB·집중력 복원 버튼 위치 겹침 정리
- [ ] 미로그인 안내 UI 중복 코드(ChatWidget/LessonChatPanel) 공통화

**대상**: `LoginPage.css`, `src/components/chat/*.css`, `ChatWidget.tsx`, `LessonChatPanel.tsx`
**검증**: 전 화면에서 구 보라색이 보이지 않는지, 모바일(375px)에서 로그인·챗 정상 동작.

---

## Phase 7 — 새 테마 적용 ③: 학습 화면 · 마크다운/코드블록

**목표**: 핵심 콘텐츠 소비 화면을 새 디자인으로 완성한다.

- [ ] `ReactLearnPage`·`LMSPage`·`RoadmapPage`·`AdminPanel` 새 테마 리스킨
- [ ] #29 `LMSPage`의 중복 ReactMarkdown 구현 제거 → `MarkdownRenderer`로 통일
- [ ] #28 Prism 테마를 새 디자인과 어울리는 것으로 교체 (다크 시안이면 다크 코드블록 유지, 라이트 시안이면 라이트 코드 테마)
- [ ] #59 코드 블록 복사 버튼 추가 (개발자 타겟 필수)
- [ ] #44 본문 행간·글줄 길이(max-width) 가독성 조정

**대상**: 각 페이지 CSS, `MarkdownRenderer.tsx`
**검증**: 레슨·강의 화면에서 코드 복사 동작, 전 페이지 테마 통일 확인.

---

## Phase 8 — 라우팅 · 안정성

**목표**: 화면이 "깨지지 않는" 기본기를 갖춘다.

- [ ] #45 Error Boundary 추가 (전역 + 안내 화면)
- [ ] #4 404 페이지 추가 — 홈/학습하기로 안내
- [ ] #3 LMSPage를 정식 라우트로 분리 (URL 공유·뒤로가기 가능하게)
- [ ] #61 라우트별 `React.lazy` code splitting (유지하기로 한 숨김 페이지들도 lazy로 분리해 번들 영향 제거)
- [ ] #62 MediaPipe(FocusManager) 사용 시점 동적 로드
- [ ] #5 🔗(백엔드 무관, 프론트 가능) 로그인 필요 기능 접근 시 `/login?redirect=` 처리

**대상**: `App.tsx`, 신규 `ErrorBoundary.tsx`/`NotFoundPage.tsx`, `FocusManagerModal.tsx`
**검증**: 잘못된 URL 접근 → 404, 렌더 오류 강제 발생 → 안내 화면, 빌드 청크 분리 확인.

---

## Phase 9 — 챗봇 UX 강화 (기능 우선순위 ①)

**목표**: 프론트 단독으로 가능한 챗봇 경험 개선을 모두 적용한다.

- [ ] #53 답변 생성 중 애니메이션 타이핑 인디케이터 (점 3개 등)
- [ ] #54 "대화 불러오는 중" vs "답변 생성 중" 상태 분리 표시
- [ ] #46 전송 실패 시 **재시도 버튼** (마지막 메시지 재전송)
- [ ] #47 상태 코드별 오류 문구 분기 (401/429/500)
- [ ] #48 세션 목록 로드 실패 무음 처리 제거 → 오류 표시, 신규세션/삭제 try/catch 추가
- [ ] #58 패널 열릴 때 입력창 오토포커스
- [ ] #55 사용자가 위로 스크롤 중이면 자동 스크롤 중지 ("새 메시지" 버튼 표시)
- [ ] #14 빈 화면 예시 질문을 클릭 가능한 suggestion chip으로
- [ ] #35 답변 영역 `aria-live="polite"`
- [ ] 🔗 **챗 스트리밍 응답**은 백엔드 SSE/스트리밍 API 필요 → Phase 14로 분리

**대상**: `src/components/chat/*`, `useChatConversation.ts`, `chatApi.ts`
**검증**: 네트워크 차단 상태에서 전송 → 오류+재시도 동작, 예시 질문 클릭 전송 확인.

---

## Phase 10 — 로드맵 → 레슨 연결 (기능 우선순위 ②)

**목표**: 타겟 사용자("어디서 시작할지 막막한 개발자")의 핵심 여정을 완성한다.

- [ ] #9 로드맵 노드 클릭 시 해당 레슨/학습 화면으로 이동 (프론트에서 노드↔레슨 매핑 데이터 작성)
- [ ] #1 메인 → 로드맵 → 레슨 3클릭 여정 완성
- [ ] #36 로드맵 아코디언에 `aria-expanded`/`aria-controls`
- [ ] #10 "AI 로드맵 생성" 카피를 현재 동작에 맞게 수정 (허위 기대 제거) — 🔗 실제 AI 생성은 백엔드 필요, Phase 14
- [ ] #70 로드맵 모바일 레이아웃 (후순위 방침이지만 노드 연결 작업과 함께 최소한의 세로 배치 대응)

**대상**: `RoadmapPage.tsx/css`, `ReactLearnPage.tsx`
**검증**: 로드맵 노드 클릭 → 해당 레슨 도달, 뒤로가기 정상.

---

## Phase 11 — 퀴즈 인터랙션 (기능 우선순위 ③)

**목표**: "정답 보기" 토글뿐인 퀴즈를 실제 학습 도구로 만든다. (현재 데이터 모델 `{question, answer, explanation}` 범위 내에서)

- [ ] #15 퀴즈 컴포넌트 분리 (`src/components/Quiz.tsx`) — 본문/모달 복붙 중복 제거
- [ ] 자가 채점 플로우: 답 생각하기 → 정답 공개 → "맞았어요/틀렸어요" 자가 표시 → 세트 완료 시 점수 요약
- [ ] #43 정오답 표시에 색+아이콘+텍스트 병행
- [ ] #13/#12 레슨별 퀴즈 결과·완료 상태 localStorage 저장 → 레슨 목록에 완료 뱃지, "이어서 학습하기"
- [ ] 퀴즈 `quizId` 제목 기반 충돌 문제 수정 (레슨 id 기반으로)
- [ ] 🔗 객관식 선택지·서버 채점 저장은 백엔드 콘텐츠 스키마 변경 필요 → Phase 14

**대상**: 신규 `Quiz.tsx`, `ReactLearnPage.tsx`
**검증**: 퀴즈 풀기 → 점수 요약 → 새로고침 후에도 완료 상태 유지.

---

## Phase 12 — 접근성 일괄 정비

**목표**: 키보드·스크린리더 사용자도 전 기능을 쓸 수 있게 한다.

- [ ] #32 클릭 가능한 `<div>` → `<button>`/`<a>` 전환 (topic-option, lesson-card, lecture-item, 로드맵 노드)
- [ ] #34 아이콘 전용 버튼 전체에 `aria-label`
- [ ] #38 페이지별 `<h1>` 1개·heading 순차 구조 정리
- [ ] #39 Skip-to-content 링크 + `<main>` 랜드마크 정비
- [ ] #40 새 테마 색상 대비 WCAG AA 검증 (axe DevTools) 및 미달 색 보정
- [ ] #51 "관리자 패널에서 콘텐츠를 생성해주세요" 등 내부 용어 문구를 사용자 친화 문구로 교체

**대상**: 전 페이지 (패턴 반복 작업)
**검증**: 마우스 없이 Tab/Enter만으로 주요 여정 완주, axe 스캔 크리티컬 0건.

---

## Phase 13 — 반응형 마무리 · 성능 점검

**목표**: 남은 반응형 이슈를 정리하고 개선 효과를 측정한다.

- [ ] #68 브레이크포인트를 Phase 2에서 정한 공통 값으로 전 파일 통일
- [ ] #73 터치 타겟 44×44px 점검·보정
- [ ] #75 FocusManager 웹캠 모달 반응형 (고정 640×480 제거)
- [ ] #67 Lighthouse(모바일) 측정 → 성능·접근성 점수 기록, 회귀 기준선 확보
- [ ] 체크리스트(`ui-ux-checklist.md`) 전체 재점검 — ❌→✅ 전환율 기록

**검증**: 375px/768px/1280px 3구간 전 화면 확인, Lighthouse 리포트 저장.

---

## Phase 14 — 백엔드 연계 · 후순위 항목 🔗

백엔드 API 협의가 필요하거나 후순위로 미룬 항목. 착수 시 백엔드와 스펙 협의 선행.

| 항목 | 필요한 백엔드 변경 |
|---|---|
| #53 챗 스트리밍 응답 | SSE/청크 스트리밍 응답 API |
| #16 RAG 근거 문서 링크화 | sources에 레슨 id·문서 위치(페이지/청크) 메타 포함 |
| #10 AI 로드맵 실제 생성 | 로드맵 생성 API |
| #15 퀴즈 객관식·서버 채점 | 퀴즈 스키마에 선택지 추가, 응답 저장 API |
| #12 진도 서버 저장 | 사용자별 진도 API (localStorage → 서버 이관) |
| 다크모드 토글 구현 | 백엔드 불필요 — Phase 2 토큰 기반으로 프론트 구현 |

---

## 진행 현황판

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 디자인 시안 3종 → 선택 | ✅ 시안 B 선택 |
| 1 | 기초 정리 (타이틀·lang·CSS 오염) | ✅ |
| 2 | 디자인 토큰 구축 | ✅ |
| 3 | Button · Spinner · Skeleton | ✅ |
| 4 | Modal · Toast | ✅ |
| 5 | 새 테마: Header · Main | ✅ |
| 6 | 새 테마: 로그인 · 챗 (+모바일) | ✅ |
| 7 | 새 테마: 학습 화면 · 코드블록 | ✅ |
| 8 | 라우팅 · Error Boundary · lazy | ✅ |
| 9 | 챗봇 UX | ✅ |
| 10 | 로드맵 → 레슨 연결 | ⬜ |
| 11 | 퀴즈 인터랙션 | ⬜ |
| 12 | 접근성 일괄 | ⬜ |
| 13 | 반응형 마무리 · 측정 | ⬜ |
| 14 | 백엔드 연계 🔗 | ⬜ |

### 진행 메모 (Phase 2~9 완료, 2026-07-27)

- **Phase 2**: 구 테마 변수명(`--color-bg-card` 등)을 새 다크 토큰으로 매핑하는 **레거시 호환 레이어**를 index.css에 두어, 아직 리스킨하지 않은 화면(AdminPanel·LearningManager·Wireframe)도 다크 톤으로 동작함. 해당 화면 전면 리스킨 시 레이어 제거 예정.
- **Phase 4**: FocusManagerModal(웹캠)은 공용 Modal로 교체하지 않음 — 웹캠 생명주기 로직 리스크가 커서 Phase 13(반응형 정비)에서 함께 처리.
- **Phase 8**: #62(MediaPipe 지연 로드)는 기존 코드가 이미 열 때 동적 import하고 있어 추가 작업 불필요 확인. 라우트 lazy 분할로 페이지별 청크 분리 완료(초기 JS 1,183→1,078kB, 페이지 코드 별도 청크화).
- **Phase 9**: 챗 스트리밍 응답은 백엔드 SSE 필요 → 계획대로 Phase 14 유지.
