import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RoadmapPage.css';

type Level = '초급' | '중급' | '고급';

/** 로드맵 말단 항목 — 개념 설명 / 외부 자료 링크 / 추천 책 */
type Leaf =
  | { kind: 'detail'; text: string }
  | { kind: 'link'; icon: string; href: string; label: string; desc?: string; book?: boolean }
  | { kind: 'book'; text: string };

interface SubBranch {
  id: string;
  title: string;
  items: Leaf[];
}

interface Branch {
  id: string;
  className: string;
  title: string;
  /** 학습하기 화면과 연결되는 레벨 (커뮤니티 등 없으면 미연결) */
  level?: Level;
  subs: SubBranch[];
}

const d = (text: string): Leaf => ({ kind: 'detail', text });
const link = (icon: string, href: string, label: string, desc?: string): Leaf => ({ kind: 'link', icon, href, label, desc });
const bookLink = (href: string, label: string): Leaf => ({ kind: 'link', icon: '📚', href, label, book: true });
const book = (text: string): Leaf => ({ kind: 'book', text });

const BRANCHES: Branch[] = [
  {
    id: 'beginner',
    className: 'beginner',
    title: '초급 (Beginner)',
    level: '초급',
    subs: [
      {
        id: 'prerequisites',
        title: '필수 선수 과목',
        items: [
          d('HTML & CSS: 웹 페이지의 구조와 스타일링을 위한 기본 언어'),
          link('📖', 'https://developer.mozilla.org/ko/docs/Web/HTML', 'MDN HTML 가이드'),
          link('📖', 'https://developer.mozilla.org/ko/docs/Web/CSS', 'MDN CSS 가이드'),
          link('🎥', 'https://www.youtube.com/watch?v=88PXJAA6szs', '생활코딩 HTML/CSS 기초'),
          d('JavaScript (ES6+): React 포함 모든 프론트엔드 프레임워크의 기반. 화살표 함수, 클래스, 비구조화 할당, 모듈 등 ES6+ 문법 필수'),
          link('📖', 'https://ko.javascript.info/', '모던 자바스크립트 튜토리얼'),
          link('🎥', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', '드림코딩 JavaScript 기초'),
          link('📄', 'https://developer.mozilla.org/ko/docs/Web/JavaScript', 'MDN JavaScript 가이드'),
          link('🎥', 'https://www.youtube.com/watch?v=Oe421EPjeBE', '노마드코더 JavaScript 기초'),
          book('추천 책: 『모던 JavaScript 튜토리얼』'),
          d('Git & GitHub 기초: 버전 관리 시스템. 협업 및 코드 관리에 필수'),
          link('📖', 'https://git-scm.com/book/ko/v2', 'Git 공식 문서 (한국어)'),
          link('🎥', 'https://www.youtube.com/watch?v=1I3hMwQU6GU', '생활코딩 Git 기초'),
          link('📄', 'https://github.com/explore', 'GitHub 가이드'),
          link('🎥', 'https://www.youtube.com/watch?v=3RjQznt-8kE', '드림코딩 Git & GitHub'),
        ],
      },
      {
        id: 'core-concepts',
        title: '핵심 개념 및 기술',
        items: [
          d('React 개요: React가 무엇인지, 왜 사용하는지, 어떤 특징(컴포넌트 기반, 선언적, 가상 DOM)을 가지는지 이해'),
          d('JSX: JavaScript 확장 문법으로, React에서 UI를 작성하는 방식'),
          d('컴포넌트 (함수 vs 클래스): React 앱의 기본 빌딩 블록. 사용법 및 차이점 이해'),
          d('Props: 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법'),
          d('State (useState 훅): 컴포넌트 내부에서 관리되는 변경 가능한 데이터'),
          d('이벤트 핸들링: 사용자 인터랙션(클릭, 입력 등)을 처리하는 방법'),
          d('조건부 렌더링: 특정 조건에 따라 다른 UI를 보여주는 방법'),
          d('리스트 렌더링과 `key`: 배열 데이터를 사용하여 여러 컴포넌트를 렌더링하는 방법과 `key`의 중요성 이해'),
          d('React 개발 환경 설정: `create-react-app` 또는 Vite를 사용하여 프로젝트 시작'),
          d('기본 CSS 스타일링: 컴포넌트에 CSS를 적용하는 방법 (인라인, CSS 모듈, CSS-in-JS 개념)'),
          link('📖', 'https://ko.react.dev/', 'React 공식 문서 (한국어)'),
          link('🎥', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', '드림코딩 React 기초'),
          link('📄', 'https://velopert.com/reactjs-tutorials', '벨로퍼트 React 튜토리얼'),
          link('🎥', 'https://www.youtube.com/watch?v=w5s2UoWvNQY', '노마드코더 React 기초'),
          bookLink('https://react.vlpt.us/', '벨로퍼트 React 강의 (PDF 스타일)'),
          link('🎥', 'https://www.youtube.com/watch?v=0yWAtQ6wYNM', '코딩애플 React 강의'),
          book('추천 책: 『리액트를 다루는 기술』 (김민준 저), 『혼자 공부하는 머신러닝+딥러닝』 (박해선 저)'),
        ],
      },
      {
        id: 'beginner-tools',
        title: '주요 라이브러리/도구',
        items: [
          d('Node.js & npm/yarn: React 개발 환경 구축 및 패키지 관리'),
          d('Create React App / Vite: React 프로젝트를 빠르게 시작하는 도구'),
          link('📄', 'https://nodejs.org/ko/docs', 'Node.js 공식 문서'),
          link('📄', 'https://create-react-app.dev/docs/getting-started/', 'Create React App 공식 문서'),
          link('📄', 'https://vitejs.dev/guide/', 'Vite 공식 문서'),
        ],
      },
    ],
  },
  {
    id: 'intermediate',
    className: 'intermediate',
    title: '중급 (Intermediate)',
    level: '중급',
    subs: [
      {
        id: 'intermediate-concepts',
        title: '핵심 개념 및 기술',
        items: [
          d('Hooks 심화: 더 복잡한 상태 및 사이드 이펙트 관리'),
          d('• useEffect: 사이드 이펙트(데이터 가져오기, DOM 조작 등) 처리'),
          d('• useRef: DOM 요소 접근, 렌더링과 무관한 값 유지'),
          d('• useMemo / useCallback: 성능 최적화를 위한 훅'),
          d('• useReducer: 복잡한 상태 로직 관리에 유용'),
          d('• useContext: 전역적인 상태 관리를 위한 훅'),
          link('📖', 'https://ko.react.dev/reference/react', 'React Hooks 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=G3qglTF-fFI', '드림코딩 React Hooks'),
          d('React Router: SPA에서 라우팅(페이지 이동)을 구현하는 표준 라이브러리. `BrowserRouter`, `Routes`, `Route`, `Link` 등'),
          link('📄', 'https://reactrouter.com/en/main', 'React Router 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=CHHXeHVK-8U', '벨로퍼트 React Router'),
          d('상태 관리 라이브러리: 복잡하고 큰 규모의 앱을 위한 상태 관리'),
          d('• Redux (또는 Redux Toolkit): 예측 가능한 상태 관리를 위한 라이브러리 (Actions, Reducers, Store)'),
          d('• Context API: 간단한 전역 상태 관리에 사용'),
          d('• 기타: Zustand, Recoil, Jotai (Redux보다 가볍고 사용하기 쉬운 대안)'),
          link('📖', 'https://redux.js.org/introduction/getting-started', 'Redux 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=QZcYz2NrPIs', '벨로퍼트 Redux 강의'),
          link('📄', 'https://redux-toolkit.js.org/', 'Redux Toolkit 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=9DU7wZr5bdA', '드림코딩 Redux Toolkit'),
          d('비동기 처리: `fetch` API 또는 `Axios`를 사용하여 서버에서 데이터 가져오기'),
          d('커스텀 훅 (Custom Hooks): 반복되는 로직을 재사용 가능한 훅으로 만들기'),
          d('성능 최적화 기초: `React.memo` 활용'),
          d('React Life Cycle 이해: 컴포넌트 생명주기 메서드 및 `useEffect`로 생명주기 동작 시뮬레이션'),
          book('추천 책: 『리액트를 다루는 기술』 (김민준 저), 『모던 리액트 Deep Dive』 (김용찬 저)'),
        ],
      },
      {
        id: 'intermediate-tools',
        title: '주요 라이브러리/도구',
        items: [
          d('React Router v6+'),
          d('Redux / Redux Toolkit'),
          d('Axios'),
          d('ESLint, Prettier: 코드 품질 유지 및 일관된 코드 스타일 적용'),
        ],
      },
    ],
  },
  {
    id: 'advanced',
    className: 'advanced',
    title: '고급 (Advanced)',
    level: '고급',
    subs: [
      {
        id: 'typescript',
        title: 'TypeScript',
        items: [
          d('TypeScript: JavaScript에 정적 타입을 추가하여 코드 안정성과 가독성 향상'),
          d('React와 TypeScript 연동: 대규모 프로젝트에서 필수적'),
          link('📖', 'https://www.typescriptlang.org/ko/', 'TypeScript 공식 문서 (한국어)'),
          link('🎥', 'https://www.youtube.com/watch?v=BwuLxPH8IDs', '드림코딩 TypeScript 기초'),
          link('📄', 'https://typescript-kr.github.io/', 'TypeScript 한국어 가이드'),
          link('🎥', 'https://www.youtube.com/watch?v=0yWAtQ6wYNM', '코딩애플 TypeScript 강의'),
          link('📖', 'https://react.vlpt.us/using-typescript/', '벨로퍼트 React + TypeScript'),
        ],
      },
      {
        id: 'frameworks',
        title: '프레임워크',
        items: [
          d('Next.js / Remix: React 기반의 풀스택 프레임워크'),
          d('SSR, SSG, ISR (렌더링 방식): SEO 개선 및 초기 로딩 성능 향상'),
          d('API 라우트: 백엔드 API 기능 내장'),
          d('데이터 페칭 전략: 다양한 데이터 로딩 방식 이해'),
          link('📖', 'https://nextjs.org/ko/docs', 'Next.js 공식 문서 (한국어)'),
          link('🎥', 'https://www.youtube.com/watch?v=1zV1x4VqR8g', '드림코딩 Next.js 기초'),
          link('📄', 'https://vercel.com/docs', 'Vercel 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=6aP9nyTcd44', '노마드코더 Next.js 강의'),
          link('📖', 'https://remix.run/docs/en/main', 'Remix 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=0yWAtQ6wYNM', '코딩애플 Next.js 강의'),
          book('추천 책: 『실전 Next.js』 (김정환 저)'),
        ],
      },
      {
        id: 'testing',
        title: '테스팅',
        items: [
          d('단위 테스트 (Jest, React Testing Library): 개별 컴포넌트나 함수 테스트'),
          d('통합 테스트: 여러 컴포넌트 또는 모듈이 함께 작동하는지 테스트'),
          d('E2E 테스트 (Cypress, Playwright 개념): 사용자 시나리오 전체 흐름 테스트'),
          link('📖', 'https://testing-library.com/docs/react-testing-library/intro/', 'React Testing Library 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=GLSSRtnNY0g', '드림코딩 React 테스팅'),
          link('📄', 'https://jestjs.io/ko/', 'Jest 공식 문서 (한국어)'),
          link('🎥', 'https://www.youtube.com/watch?v=7dTTFW7yACQ', '벨로퍼트 React 테스팅'),
          link('📖', 'https://docs.cypress.io/', 'Cypress 공식 문서'),
          link('🎥', 'https://www.youtube.com/watch?v=0yWAtQ6wYNM', '코딩애플 테스팅 강의'),
        ],
      },
      {
        id: 'advanced-concepts',
        title: '핵심 개념 및 기술 (고급 심화)',
        items: [
          d('성능 최적화 심화: 번들 최적화, 이미지 최적화, 코드 스플리팅, 웹 워커 (개념)'),
          d('상태 관리 심화: TanStack Query (React Query) 등 비동기 상태 관리 라이브러리 활용'),
          link('📖', 'https://tanstack.com/query/latest/docs/react/overview', 'TanStack Query 공식 문서'),
          book('추천 책: 『React Query 완벽 가이드』 (강대명 저)'),
          d('컴포넌트 디자인 시스템 (Storybook): 재사용 가능한 UI 컴포넌트 개발 및 문서화'),
          link('📖', 'https://storybook.js.org/docs/react/get-started/introduction', 'Storybook 공식 문서'),
          d('웹 접근성 (Web Accessibility): 모든 사용자가 웹 콘텐츠에 동등하게 접근할 수 있도록 하는 방법'),
          link('📄', 'https://developer.mozilla.org/ko/docs/Web/Accessibility', 'MDN 웹 접근성 가이드'),
          d('애플리케이션 배포 (Deployment): Vercel, Netlify, AWS Amplify 등 서비스를 이용한 배포'),
          link('📄', 'https://vercel.com/docs/deployments', 'Vercel 배포 가이드'),
          link('📄', 'https://docs.netlify.com/get-started/', 'Netlify 시작 가이드'),
          d('Node.js & 백엔드 이해: API 연동 및 풀스택 개발에 대한 이해'),
        ],
      },
      {
        id: 'advanced-tools',
        title: '주요 라이브러리/도구 (고급)',
        items: [
          d('TypeScript'),
          d('Next.js / Remix'),
          d('Jest, React Testing Library'),
          d('TanStack Query (React Query)'),
          d('Storybook'),
          d('Cypress / Playwright'),
        ],
      },
    ],
  },
  {
    id: 'community',
    className: 'community',
    title: '추천 커뮤니티',
    subs: [
      {
        id: 'korea-community',
        title: '국내 온라인 커뮤니티/카페',
        items: [
          link('🔗', 'https://www.facebook.com/groups/react.ko/', 'React Korea (페이스북 그룹):', '한국 React 개발자들의 활발한 교류 공간'),
          link('🔗', 'https://velopert.com/', '벨로퍼트 개발자 커뮤니티:', 'React 관련 질문 및 답변, 블로그 연계'),
          link('🔗', 'https://cafe.naver.com/codinguniv', "네이버 카페 '생활코딩':", '웹 개발 전반, React 초보자에게 친숙'),
          link('🔗', 'https://cafe.naver.com/frontendcafe', "네이버 카페 '프론트엔드 개발자 모임':", '프론트엔드 심화 논의'),
          link('🔗', 'https://developers.google.com/community/gdsc', 'GDSC (Google Developers Student Clubs):', '대학생 개발자 커뮤니티, 스터디/프로젝트'),
        ],
      },
      {
        id: 'global-community',
        title: '해외 온라인 커뮤니티/포럼',
        items: [
          link('🔗', 'https://stackoverflow.com/questions/tagged/reactjs', 'Stack Overflow:', '프로그래밍 질문/답변의 가장 큰 허브'),
          link('🔗', 'https://www.reddit.com/r/reactjs/', 'Reddit (r/reactjs):', 'React 전용 서브레딧, 최신 소식/트렌드'),
          link('🔗', 'https://discord.gg/reactiflux', 'Discord/Slack 채널 (Reactiflux 등):', '공식 및 비공식 커뮤니티, 실시간 질의응답'),
        ],
      },
      {
        id: 'youtube',
        title: '유튜브 채널',
        items: [
          link('🎥', 'https://www.youtube.com/@dreamcoding', '드림코딩 by 엘리:', 'React 포함 웹 개발 전반 양질의 한국어 강의'),
          link('🎥', 'https://www.youtube.com/@codingapple', '코딩애플:', '실용적인 React 프로젝트 및 설명 (한국어)'),
          link('🎥', 'https://www.youtube.com/@nomadcoders', '노마드 코더스:', 'React 및 다양한 프론트엔드 기술 실전 강의'),
          link('🎥', 'https://www.youtube.com/@react', 'React (Official Channel):', 'React 공식 팀 채널, 최신 업데이트/컨퍼런스'),
          link('🎥', 'https://www.youtube.com/@GoogleDevelopersKorea', 'Google Developers Korea:', '구글 개발자 소식 및 기술 튜토리얼'),
          link('🎥', 'https://www.youtube.com/@velopert', '벨로퍼트:', 'React 관련 강의 및 튜토리얼'),
        ],
      },
    ],
  },
];

const ALL_BRANCH_IDS = BRANCHES.map(branch => branch.id);
const ALL_SUB_IDS = BRANCHES.flatMap(branch => branch.subs.map(sub => sub.id));

function LeafNode({ item }: { item: Leaf }) {
  if (item.kind === 'detail') {
    return <div className="detail-node">{item.text}</div>;
  }
  if (item.kind === 'book') {
    return <div className="book-node">📚 {item.text}</div>;
  }
  return (
    <div className={item.book ? 'book-node' : 'resource-node'}>
      {item.icon}{' '}
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {item.label}
      </a>
      {item.desc ? <> {item.desc}</> : null}
    </div>
  );
}

export default function RoadmapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || 'react';
  let topicLabel = 'React';
  if (topic === 'ml') topicLabel = 'Machine Learning';
  else if (topic === 'python') topicLabel = 'Python';
  else if (topic === 'react') topicLabel = 'React';

  const [mainBranchesVisible, setMainBranchesVisible] = useState(true);
  const [expandedBranches, setExpandedBranches] = useState<{ [key: string]: boolean }>({
    beginner: true,
    intermediate: true,
    advanced: true,
    community: true,
  });
  const [expandedSubBranches, setExpandedSubBranches] = useState<{ [key: string]: boolean }>({});

  const toggleAllBranches = () => setMainBranchesVisible(v => !v);
  const toggleBranch = (branchId: string) =>
    setExpandedBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
  const toggleSubBranch = (subBranchId: string) =>
    setExpandedSubBranches(prev => ({ ...prev, [subBranchId]: !prev[subBranchId] }));

  const expandAll = () => {
    setMainBranchesVisible(true);
    setExpandedBranches(Object.fromEntries(ALL_BRANCH_IDS.map(id => [id, true])));
    setExpandedSubBranches(Object.fromEntries(ALL_SUB_IDS.map(id => [id, true])));
  };

  const collapseAll = () => {
    setMainBranchesVisible(false);
    setExpandedBranches({});
    setExpandedSubBranches({});
  };

  /** 로드맵 → 학습하기 연결: 해당 레벨이 선택된 상태로 이동 */
  const goToLessons = (level: Level) => {
    navigate('/react-learn', { state: { level } });
  };

  const getIcon = (expanded: boolean) => (
    <span className={expanded ? 'expand-icon rotated' : 'expand-icon'} aria-hidden="true">
      {expanded ? '▼' : '▶'}
    </span>
  );

  return (
    <div className="roadmap-page">
      <div className="mindmap-container">
        <h1 className="mindmap-title">{topicLabel} 학습 로드맵</h1>
        <div className="controls">
          <button className="btn" onClick={expandAll}>전체 펼치기</button>
          <button className="btn" onClick={collapseAll}>전체 접기</button>
        </div>
        <div className="mindmap">
          <button
            type="button"
            className="root-node"
            onClick={toggleAllBranches}
            aria-expanded={mainBranchesVisible}
            aria-controls="mainBranches"
          >
            {topicLabel} 학습 로드맵
          </button>
          <div
            className="main-branches"
            id="mainBranches"
            style={{ display: mainBranchesVisible ? 'flex' : 'none' }}
          >
            {BRANCHES.map(branch => {
              const branchExpanded = !!expandedBranches[branch.id];
              return (
                <div className="branch" key={branch.id}>
                  <button
                    type="button"
                    className={`level-node ${branch.className}`}
                    onClick={() => toggleBranch(branch.id)}
                    aria-expanded={branchExpanded}
                    aria-controls={branch.id}
                  >
                    {branch.title} {getIcon(branchExpanded)}
                  </button>
                  <div
                    className={'sub-branches' + (branchExpanded ? ' expanded' : '')}
                    id={branch.id}
                    style={{ display: branchExpanded ? 'block' : 'none' }}
                  >
                    {branch.level && (
                      <button
                        type="button"
                        className="roadmap-start-btn"
                        onClick={() => goToLessons(branch.level!)}
                      >
                        📚 {branch.level} 레슨 바로 학습하기 →
                      </button>
                    )}
                    {branch.subs.map(sub => {
                      const subExpanded = !!expandedSubBranches[sub.id];
                      return (
                        <div key={sub.id}>
                          <button
                            type="button"
                            className="sub-node"
                            onClick={() => toggleSubBranch(sub.id)}
                            aria-expanded={subExpanded}
                            aria-controls={sub.id}
                          >
                            {sub.title} {getIcon(subExpanded)}
                          </button>
                          <div
                            className={'sub-branches' + (subExpanded ? ' expanded' : '')}
                            id={sub.id}
                            style={{ display: subExpanded ? 'block' : 'none' }}
                          >
                            {sub.items.map((item, index) => (
                              <LeafNode key={index} item={item} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
