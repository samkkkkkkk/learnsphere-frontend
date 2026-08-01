# 아이콘 교체·추가 가이드 (`Icon.tsx`)

> 대상 파일: `src/components/ui/Icon.tsx`
> 작성일: 2026-07-27 (폰트 셀프호스팅 라운드에서 Font Awesome을 제거하며 도입)

노출 화면(Header·MainPage)의 아이콘은 Font Awesome 웹폰트 대신 **자체 인라인 SVG 컴포넌트**를 쓴다.
아이콘 모양이 마음에 안 들면 이 문서의 절차대로 패스만 갈아끼우면 된다.

## 1. Icon.tsx의 구조

파일은 세 부분으로 이루어져 있다:

```tsx
// ① 아이콘 이름 목록 (타입) — 이름이 어긋나면 빌드에서 잡힌다
export type IconName = 'zap' | 'check-circle' | 'crosshair' | 'sparkles' | 'book-open' | 'map';

// ② 이름 → SVG 도형 매핑 ★ 아이콘 교체 지점
const PATHS: Record<IconName, React.ReactNode> = {
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  // ...
};

// ③ 공통 래퍼 — viewBox 24×24, stroke: currentColor, 굵기 2 등을 일괄 지정
const Icon = ({ name, size = 16, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} ...>
    {PATHS[name]}
  </svg>
);
```

색·선 굵기·크기는 전부 ③ 래퍼가 처리한다. 색은 `currentColor`라 부모의 `color`를
그대로 따르므로(예: 메인 기능 칩의 앰버/블루/그린), 모양을 바꿀 때는 **② `PATHS`의
도형 내용물만** 수정하면 된다.

## 2. 기존 아이콘 모양 바꾸기

1. **[lucide.dev](https://lucide.dev)** (또는 [feathericons.com](https://feathericons.com))에서
   원하는 아이콘을 찾는다. 현재 아이콘들이 이 계열(24×24, 선 기반)이라 여기서 고르면
   스타일이 그대로 어울린다.
2. 아이콘 페이지에서 **Copy SVG**로 코드를 복사한다. 이런 형태다:

   ```html
   <svg xmlns="..." width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ...>
     <path d="M12 20h9"/>
     <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
   </svg>
   ```

3. 바깥 `<svg>` 태그는 버리고 **안쪽 도형들만**(`<path>`, `<line>`, `<circle>`,
   `<polygon>`, `<polyline>` 등) 가져와 `PATHS`의 해당 항목에 붙여넣는다.

   예 — "AI 기반 설명"의 `sparkles`를 연필(pen) 아이콘으로 바꾸는 경우:

   ```tsx
   sparkles: (
     <>
       <path d="M12 20h9" />
       <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
     </>
   ),
   ```

   - 도형이 하나면 그대로, 여러 개면 `<>...</>`(프래그먼트)로 감싼다.
   - JSX이므로 케밥 케이스 속성이 딸려오면 카멜 케이스로 바꾼다
     (`stroke-width` → `strokeWidth`). 보통 도형 요소에는 속성이 없어 그대로 붙는다.
4. 저장하면 dev 서버가 핫 리로드한다. 색·크기는 자동으로 기존 테마를 따른다.

## 3. 새 아이콘 추가하기

기존 이름을 재활용하지 않고 새로 추가하려면 두 곳을 같이 수정한다:

1. `IconName` 유니언 타입에 이름 추가: `... | 'map' | 'pen'`
2. `PATHS`에 같은 이름으로 항목 추가

그다음 사용처에서 `<Icon name="pen" />`으로 쓴다. 크기가 다르면 `size` prop
(`<Icon name="pen" size={20} />`), 추가 스타일이 필요하면 `className`을 넘긴다.
타입과 매핑이 어긋나면 TypeScript가 빌드에서 잡아준다.

## 4. 현재 아이콘 → 사용처 매핑

| 이름 | 모양 | 쓰이는 곳 |
|---|---|---|
| `zap` | 번개 | Header "집중력 매니저" 버튼 |
| `check-circle` | 원+체크 | MainPage "100% 검증된 자료" 칩 |
| `crosshair` | 조준선 | MainPage "개인 맞춤형" 칩 |
| `sparkles` | 반짝임 | MainPage "AI 기반 설명" 칩 |
| `book-open` | 펼친 책 | MainPage "학습 로드맵 보기" 카드 제목 |
| `map` | 지도 | MainPage "로드맵 보기" CTA 버튼 |

관련 CSS: 메인 기능 칩의 배경·크기는 `MainPage.css`의 `.feature-item .ui-icon`
(48×48 칩, padding 14px), 카드 제목 아이콘 색은 `.card-header h2 .ui-icon`에 있다.

## 5. 주의사항

- **면(fill) 기반 아이콘 주의**: Font Awesome solid처럼 면으로 그려진 아이콘을 붙이면
  래퍼의 `fill="none"` 때문에 윤곽선만 보인다. 선(stroke) 기반인 Lucide/Feather 계열에서
  고르는 게 안전하다. 꼭 면 기반을 쓰려면 해당 도형에만 `fill="currentColor" stroke="none"`을
  직접 지정한다.
- **viewBox는 24×24 기준**: 다른 좌표계(예: FA의 512×512) SVG를 그대로 붙이면 잘려 보인다.
  반드시 24×24 기준 아이콘을 사용한다.
- **접근성**: 래퍼가 `aria-hidden="true"`를 붙이므로 아이콘은 장식 요소다. 아이콘만으로
  의미를 전달해야 하는 버튼이라면 버튼 쪽에 `aria-label`을 붙일 것 (체크리스트 #34 참조).
- **LearningManager 페이지는 예외**: 숨김 페이지라 Font Awesome(`fas fa-*`)을 그대로 쓰며,
  FA CSS는 해당 페이지 청크에서만 로드된다. 이 페이지를 정식 노출할 때 Icon 컴포넌트로
  전환하는 것을 권장한다.
