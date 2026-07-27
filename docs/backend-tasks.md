# 백엔드 연계 태스크 정리

> 작성일: 2026-07-27 · 기반: [`ui_ux_plan.md`](./ui_ux_plan.md) Phase 14, [`ui-ux-checklist.md`](./ui-ux-checklist.md) 잔여 항목
> 프론트 UI/UX 개선(Phase 0~13 + 성능 라운드 2회)이 완료된 시점 기준으로, **백엔드 API 변경이 있어야 진행 가능한 항목**을 정리한다.
> 아래 스펙은 프론트 관점의 **제안**이며, 착수 전 백엔드와 협의해 확정한다 (계획서 진행 원칙).

## 현재 프론트가 사용하는 API

| 영역 | 엔드포인트 | 비고 |
|---|---|---|
| 인증 | `POST /api/v1/auth/signup` · `login` → `{access_token}`, `GET /api/v1/auth/me` | Bearer 토큰 |
| 레슨 | `GET /api/v1/lessons` (레벨별 인덱스), `GET /api/v1/lessons/{id}` | 퀴즈는 `{question, answer, explanation}` |
| 챗 | `POST·GET /api/v1/chat/sessions`, `DELETE /sessions/{id}`, `GET·POST /sessions/{id}/messages` | 답변은 `{answer, sources: string[]}` 일괄 응답 |
| 관리자 | `/api/v1/admin/*` (생성·세대·버전) | X-Admin-API-Key |

---

## 우선순위 요약

| 순위 | 태스크 | 체크리스트 # | 스코프 |
|---|---|---|---|
| P1 | 챗 답변 스트리밍 (SSE) | #53 | API 1개 변경 |
| P1 | RAG 근거(sources) 메타 구조화 | #16 | 응답 스키마 확장 |
| P2 | 사용자 진도 서버 저장 | #12·#13 | 신규 API 2~3개 |
| P3 | 퀴즈 객관식 + 서버 채점 | #15 | 콘텐츠 스키마 + 신규 API |
| P3 | 로드맵 노드 ↔ 레슨 매핑 메타 | #9 고도화 | 콘텐츠 메타 |
| P4 | AI 로드맵 실제 생성 | #10 | 신규 기능 |

---

## P1-1. 챗 답변 스트리밍 (SSE) — #53

**프론트 현황**: `POST /api/v1/chat/sessions/{id}/messages`가 답변 완성 후 일괄 반환. 프론트는 대기 중 점 3개 타이핑 인디케이터를 표시한다(Phase 9). 답변이 길면 수 초간 인디케이터만 보인다.

**필요한 백엔드 작업**: 답변을 토큰 단위로 스트리밍하는 응답 방식 추가 (SSE 권장).

**제안 스펙**
```
POST /api/v1/chat/sessions/{id}/messages
Accept: text/event-stream      # 기존 JSON 클라이언트와 공존 (Accept로 분기)

event: delta   data: {"text": "..."}        # 토큰/청크 단위, N회
event: sources data: {"sources": [...]}     # 답변 종료 직전 1회 (P1-2 스키마)
event: done    data: {}                     # 정상 종료
event: error   data: {"detail": "..."}      # 스트림 중 오류
```

**프론트 후속 작업**: `useChatConversation`에 EventSource/fetch-stream 수신 로직, 타이핑 인디케이터 → 점진 렌더 전환.
**완료 기준**: 첫 토큰이 1초 내 도착해 화면에 찍히기 시작. 스트림 중단 시 기존 재시도 UI(#46)로 복구.

## P1-2. RAG 근거(sources) 메타 구조화 — #16

**프론트 현황**: `sources: string[]`(문서 제목만) → 클릭 불가능한 텍스트 pill로 표시. 체크리스트 잔여 ❌ 2건 중 하나.

**필요한 백엔드 작업**: sources 항목에 원문 위치 메타 포함.

**제안 스펙**
```jsonc
// ChatAnswer.sources 항목
{
  "title": "useState 완전 정복",
  "lesson_id": 12,          // 앱 내 레슨이면 id, 외부 문서면 null
  "location": "chunk:3",    // 청크/페이지 등 위치 식별자
  "snippet": "useState는 ..." // 근거 문단 발췌 (선택)
}
```

**프론트 후속 작업**: pill → 클릭 시 `/react-learn`의 해당 레슨으로 이동(`lesson_id` 활용), snippet 툴팁/펼침 표시. 하위 호환: `string[]`이 오면 기존 표시 유지.
**완료 기준**: 챗 근거 pill 클릭 → 해당 레슨 도달.

## P2. 사용자 진도 서버 저장 — #12·#13

**프론트 현황**: localStorage에만 저장 (Phase 11).
- `learnsphere.quiz.lesson-{id}` — 퀴즈 자가 채점 결과(맞음/틀림 배열, 완료 여부)
- `learnsphere.lastLesson` — `{ level, lessonId }` (이어서 학습하기)

기기·브라우저를 바꾸면 진도가 사라진다.

**필요한 백엔드 작업**: 사용자별 진도 저장 API.

**제안 스펙**
```
GET  /api/v1/me/progress
→ { "last_lesson": {"level": "초급", "lesson_id": 3},
    "quiz": { "12": {"completed": true, "correct": 3, "total": 4}, ... } }

PUT  /api/v1/me/progress/last-lesson     { "level": "초급", "lesson_id": 3 }
PUT  /api/v1/me/progress/quiz/{lessonId} { "completed": true, "correct": 3, "total": 4 }
```

**프론트 후속 작업**: 로그인 시 서버 진도 로드 → localStorage와 병합(최신 우선), 이후 쓰기는 서버+localStorage 이중화(비로그인 폴백 유지). 최초 로그인 시 localStorage 진도 1회 업로드(마이그레이션).
**완료 기준**: A 기기에서 퀴즈 완료 → B 기기 로그인 시 완료 뱃지·이어서 학습 위치 복원.

## P3-1. 퀴즈 객관식 + 서버 채점 — #15

**프론트 현황**: 퀴즈 스키마가 `{question, answer, explanation}`뿐이라 자가 채점(스스로 맞았어요/틀렸어요 선택)만 가능 (Phase 11). 공용 `Quiz.tsx`로 분리돼 있어 스키마만 확장되면 교체 지점은 한 곳이다.

**필요한 백엔드 작업**
1. 퀴즈 스키마에 객관식 선택지 추가 — **콘텐츠 생성 파이프라인(AI 생성 프롬프트·저장 스키마)** 변경 수반
2. 응답 제출·채점 API (서버 채점이면 정답을 조회 응답에서 제외할지 결정 필요)

**제안 스펙**
```jsonc
// LessonDetail.quizzes 항목 확장 (기존 필드 유지 — 하위 호환)
{
  "question": "...",
  "choices": ["보기1", "보기2", "보기3", "보기4"],  // 신규
  "answer": "...", "explanation": "...",
  "id": 101                                        // 응답 저장용
}

POST /api/v1/lessons/{id}/quizzes/{quizId}/answer  { "choice_index": 2 }
→ { "correct": true, "answer_index": 2, "explanation": "..." }
```

**프론트 후속 작업**: `Quiz.tsx`에 선택지 UI 분기(choices 있으면 객관식, 없으면 기존 자가 채점 유지), 제출 결과를 진도 API(P2)와 연동.
**완료 기준**: 객관식 선택 → 서버 채점 결과·해설 표시, 기존 주관식 레슨도 깨지지 않음.

## P3-2. 로드맵 세부 노드 ↔ 레슨 매핑 메타 — #9 고도화

**프론트 현황**: 로드맵이 데이터 기반 구조로 재작성돼 있고(Phase 10), 레벨(초/중/고급) 단위 "레슨 바로 학습하기"만 연결됨. 세부 노드(예: "State (useState 훅)")에서 개별 레슨으로 바로 가는 매핑 데이터가 없다.

**필요한 백엔드 작업**: 로드맵 노드별 `lesson_id` 매핑 제공. 방식은 협의:
- A안 — 레슨 메타에 로드맵 노드 키 포함 (`GET /api/v1/lessons` 응답 확장)
- B안 — 별도 매핑 API `GET /api/v1/roadmap/react` (노드 트리 + lesson_id)

B안이면 P4(AI 로드맵 생성)의 응답 스키마와 통일하는 것을 권장.

**프론트 후속 작업**: 로드맵 데이터의 노드에 `lessonId` 필드 추가 → 노드 클릭 시 해당 레슨으로 이동.
**완료 기준**: 세부 노드 클릭 → 해당 개별 레슨 도달.

## P4. AI 로드맵 실제 생성 — #10

**프론트 현황**: 로드맵은 하드코딩 데이터(React 1종). 카피는 이미 "로드맵 보기"로 현실화해 허위 기대는 제거된 상태(Phase 10)라 급하지 않다. 주제 선택 UI(React/UniTask/Python)는 메인에 준비돼 있다.

**필요한 백엔드 작업**: 주제(·수준) 입력 → 로드맵 트리 생성 API. 생성 비용이 크면 사전 생성+캐시 방식도 무방 (프론트는 동일).

**제안 스펙**
```
POST /api/v1/roadmaps  { "topic": "python" }        # 또는 GET /api/v1/roadmaps/{topic}
→ { "topic": "python",
    "branches": [ { "id": "basic", "label": "초급 (Beginner)",
        "children": [ { "id": "syntax", "label": "기본 문법", "lesson_id": 41,
                        "children": [...] } ] } ] }
```
프론트 렌더러가 이미 데이터 기반이라, 위 트리 스키마만 맞으면 렌더링 추가 작업이 적다. `lesson_id`를 포함하면 P3-2가 함께 해결된다.

**완료 기준**: 메인에서 Python 선택 → 생성(또는 캐시)된 로드맵 표시 → 노드에서 레슨 이동.

---

## 공통 규약 (전 태스크 적용)

- **오류 상태 코드**: 프론트가 401(세션 만료)/429(잠시 후 재시도)/5xx(서버 오류)/네트워크를 구분해 안내한다(Phase 9). 새 API도 의미 있는 상태 코드 + `{"detail": "한국어 메시지"}` 형식을 유지할 것 — `detail`은 화면에 그대로 노출될 수 있다.
- **인증**: 사용자 단위 API(진도·퀴즈 응답)는 기존 Bearer 토큰 체계를 따른다.
- **하위 호환**: 스키마 확장은 기존 필드를 유지하는 방향으로 — 프론트는 구/신 응답을 모두 처리하도록 전환기를 둔다.

## 백엔드 불필요 항목 (참고)

계획서 Phase 14 표에 있던 **다크모드(라이트 모드) 토글**은 백엔드 작업이 필요 없다 — Phase 2 토큰 구조 기반으로 프론트 단독 구현 (라이트 팔레트 설계 + 대비 재검증 필요, 후순위).
