# 색상 대비 감사 결과 (#40 — WCAG AA)

> 검증일: 2026-07-27 · 대상: `src/index.css` 디자인 토큰(시안 B 다크 개발자 무드) 전 조합
> 방법: WCAG 2.1 상대 휘도 공식 기반 계산 스크립트(soft 계열 rgba는 실제 배경과 합성한 표시색으로 계산). axe DevTools 브라우저 실측은 Phase 13 Lighthouse 측정과 병행 예정.

## 결과 요약

- **텍스트 30개 조합 전부 AA(4.5:1) 통과** — 보정 2건 반영 후 기준.
- 보더 라인 3개 조합은 3:1 미달이지만 **장식 보더로 예외 처리** (아래 근거).

## 보정 내역

| 항목 | 조치 |
|---|---|
| `--color-faint` #5c6478 (bg 3.22:1, card 2.91:1 — 미달) | **#828aa0으로 상향** → bg 5.52 / card 5.00 / raise 4.66. 힌트 텍스트가 15곳 이상에서 실사용되어 토큰 자체를 AA 선으로 보정. `--color-sub`(raise 6.22)와의 위계는 유지 |
| 레거시 `--color-point` #2f6fbf (bg 3.76:1 — 미달), `--color-greige` | 정의만 있고 사용처 0곳인 죽은 변수 → **제거** |

## 텍스트 대비 측정값 (보정 후)

| 전경 | 배경 | 대비 | 판정 |
|---|---|---|---|
| ink `#e2e4ea` | bg / surface / card / raise / code-bg | 14.97 / 14.09 / 13.55 / 12.64 / 15.30 | ✅ |
| sub `#9aa1b3` | bg / surface / card / raise | 7.36 / 6.93 / 6.66 / 6.22 | ✅ |
| faint `#828aa0` | bg / card / raise | 5.52 / 5.00 / 4.66 | ✅ |
| accent `#ffb454` | bg / card / accent-soft(card 위) | 10.79 / 9.77 / 7.70 | ✅ |
| on-accent `#1a1000` | accent / accent-deep (버튼·hover) | 10.65 / 8.14 | ✅ |
| accent-deep `#e89a35` | bg | 8.25 | ✅ |
| blue `#59c2ff` | bg / card / blue-soft(card 위) | 9.59 / 8.68 / 7.16 | ✅ |
| green `#aad94c` | bg / card / green-soft(card 위) | 11.54 / 10.45 / 8.06 | ✅ |
| purple `#d2a6ff` | bg / card / purple-soft(card 위) | 9.64 / 8.73 / 6.88 | ✅ |
| red `#f07178` | bg / card / red-soft(card 위) | 6.65 / 6.02 / 5.12 | ✅ |

## 보더 라인 — 예외 처리 근거

| 조합 | 대비 |
|---|---|
| line `#232a3a` vs bg / card | 1.33 / 1.20 |
| line-strong `#2e3750` vs bg | 1.61 |

WCAG 1.4.11(비텍스트 대비 3:1)은 **경계선이 컴포넌트 식별의 유일한 수단일 때** 적용된다. 이 테마에서 상호작용 요소 식별은 ① 배경 채움 차이(버튼 앰버, 인풋 raise), ② 레이블·플레이스홀더 텍스트, ③ 전역 2px 앰버 포커스 링(10.79:1, `index.css` focus-visible 규칙)이 담당하며, 라인 토큰은 장식 구분선 용도다. 따라서 예외로 판단하고 현 값을 유지한다.
