import { useState } from 'react';
import './RoadmapPage.css';
import { useLocation } from 'react-router-dom';

const branchIds = [
  'beginner',
  'intermediate',
  'advanced',
  'community',
];
const subBranchIds = [
  'prerequisites',
  'core-concepts',
  'beginner-tools',
  'intermediate-concepts',
  'intermediate-tools',
  'typescript',
  'frameworks',
  'testing',
  'advanced-concepts',
  'advanced-tools',
  'korea-community',
  'global-community',
  'youtube',
];

export default function RoadmapPage() {
  const location = useLocation();
  const topic = location.state?.topic || 'react';
  let topicLabel = 'React';
  if (topic === 'ml') topicLabel = 'Machine Learning';
  else if (topic === 'python') topicLabel = 'Python';
  else if (topic === 'react') topicLabel = 'React';
  const [mainBranchesVisible, setMainBranchesVisible] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<{ [key: string]: boolean }>({});
  const [expandedSubBranches, setExpandedSubBranches] = useState<{ [key: string]: boolean }>({});

  const toggleAllBranches = () => {
    setMainBranchesVisible((v) => !v);
  };

  const toggleBranch = (branchId: string) => {
    setExpandedBranches((prev) => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  const toggleSubBranch = (subBranchId: string) => {
    setExpandedSubBranches((prev) => ({ ...prev, [subBranchId]: !prev[subBranchId] }));
  };

  const expandAll = () => {
    setMainBranchesVisible(true);
    const allBranches: { [key: string]: boolean } = {};
    branchIds.forEach((id) => (allBranches[id] = true));
    setExpandedBranches(allBranches);
    const allSubs: { [key: string]: boolean } = {};
    subBranchIds.forEach((id) => (allSubs[id] = true));
    setExpandedSubBranches(allSubs);
  };

  const collapseAll = () => {
    setMainBranchesVisible(false);
    setExpandedBranches({});
    setExpandedSubBranches({});
  };

  // Helper for expand icon
  const getIcon = (expanded: boolean) => (
    <span className={expanded ? 'expand-icon rotated' : 'expand-icon'}>{expanded ? '▼' : '▶'}</span>
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
        <div className="root-node" onClick={toggleAllBranches}>
          {topicLabel} 학습 로드맵
        </div>
        <div
          className="main-branches"
          id="mainBranches"
          style={{ display: mainBranchesVisible ? 'flex' : 'none' }}
        >
          {/* 초급 (Beginner) */}
          <div className="branch">
            <div
              className="level-node beginner"
              onClick={() => toggleBranch('beginner')}
            >
              초급 (Beginner) {getIcon(!!expandedBranches['beginner'])}
            </div>
            <div
              className={
                'sub-branches' + (expandedBranches['beginner'] ? ' expanded' : '')
              }
              id="beginner"
              style={{ display: expandedBranches['beginner'] ? 'block' : 'none' }}
            >
              {/* 필수 선수 과목 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('prerequisites')}
              >
                필수 선수 과목 {getIcon(!!expandedSubBranches['prerequisites'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['prerequisites'] ? ' expanded' : '')
                }
                id="prerequisites"
                style={{ display: expandedSubBranches['prerequisites'] ? 'block' : 'none' }}
              >
                <div className="detail-node">HTML &amp; CSS: 웹 페이지의 구조와 스타일링을 위한 기본 언어</div>
                <div className="resource-node">📖 <a href="https://developer.mozilla.org/ko/docs/Web/HTML" target="_blank" rel="noopener noreferrer">MDN HTML 가이드</a></div>
                <div className="resource-node">📖 <a href="https://developer.mozilla.org/ko/docs/Web/CSS" target="_blank" rel="noopener noreferrer">MDN CSS 가이드</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=88PXJAA6szs" target="_blank" rel="noopener noreferrer">생활코딩 HTML/CSS 기초</a></div>
                <div className="detail-node">JavaScript (ES6+): React 포함 모든 프론트엔드 프레임워크의 기반. 화살표 함수, 클래스, 비구조화 할당, 모듈 등 ES6+ 문법 필수</div>
                <div className="resource-node">📖 <a href="https://ko.javascript.info/" target="_blank" rel="noopener noreferrer">모던 자바스크립트 튜토리얼</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=W6NZfCO5SIk" target="_blank" rel="noopener noreferrer">드림코딩 JavaScript 기초</a></div>
                <div className="resource-node">📄 <a href="https://developer.mozilla.org/ko/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer">MDN JavaScript 가이드</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=Oe421EPjeBE" target="_blank" rel="noopener noreferrer">노마드코더 JavaScript 기초</a></div>
                <div className="book-node">📚 추천 책: 『모던 JavaScript 튜토리얼』</div>
                <div className="detail-node">Git &amp; GitHub 기초: 버전 관리 시스템. 협업 및 코드 관리에 필수</div>
                <div className="resource-node">📖 <a href="https://git-scm.com/book/ko/v2" target="_blank" rel="noopener noreferrer">Git 공식 문서 (한국어)</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=1I3hMwQU6GU" target="_blank" rel="noopener noreferrer">생활코딩 Git 기초</a></div>
                <div className="resource-node">📄 <a href="https://github.com/explore" target="_blank" rel="noopener noreferrer">GitHub 가이드</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=3RjQznt-8kE" target="_blank" rel="noopener noreferrer">드림코딩 Git &amp; GitHub</a></div>
              </div>
              {/* 핵심 개념 및 기술 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('core-concepts')}
              >
                핵심 개념 및 기술 {getIcon(!!expandedSubBranches['core-concepts'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['core-concepts'] ? ' expanded' : '')
                }
                id="core-concepts"
                style={{ display: expandedSubBranches['core-concepts'] ? 'block' : 'none' }}
              >
                <div className="detail-node">React 개요: React가 무엇인지, 왜 사용하는지, 어떤 특징(컴포넌트 기반, 선언적, 가상 DOM)을 가지는지 이해</div>
                <div className="detail-node">JSX: JavaScript 확장 문법으로, React에서 UI를 작성하는 방식</div>
                <div className="detail-node">컴포넌트 (함수 vs 클래스): React 앱의 기본 빌딩 블록. 사용법 및 차이점 이해</div>
                <div className="detail-node">Props: 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법</div>
                <div className="detail-node">State (useState 훅): 컴포넌트 내부에서 관리되는 변경 가능한 데이터</div>
                <div className="detail-node">이벤트 핸들링: 사용자 인터랙션(클릭, 입력 등)을 처리하는 방법</div>
                <div className="detail-node">조건부 렌더링: 특정 조건에 따라 다른 UI를 보여주는 방법</div>
                <div className="detail-node">리스트 렌더링과 `key`: 배열 데이터를 사용하여 여러 컴포넌트를 렌더링하는 방법과 `key`의 중요성 이해</div>
                <div className="detail-node">React 개발 환경 설정: `create-react-app` 또는 Vite를 사용하여 프로젝트 시작</div>
                <div className="detail-node">기본 CSS 스타일링: 컴포넌트에 CSS를 적용하는 방법 (인라인, CSS 모듈, CSS-in-JS 개념)</div>
                <div className="resource-node">📖 <a href="https://ko.react.dev/" target="_blank" rel="noopener noreferrer">React 공식 문서 (한국어)</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=w7ejDZ8SWv8" target="_blank" rel="noopener noreferrer">드림코딩 React 기초</a></div>
                <div className="resource-node">📄 <a href="https://velopert.com/reactjs-tutorials" target="_blank" rel="noopener noreferrer">벨로퍼트 React 튜토리얼</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=w5s2UoWvNQY" target="_blank" rel="noopener noreferrer">노마드코더 React 기초</a></div>
                <div className="book-node">📚 <a href="https://react.vlpt.us/" target="_blank" rel="noopener noreferrer">벨로퍼트 React 강의 (PDF 스타일)</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=0yWAtQ6wYNM" target="_blank" rel="noopener noreferrer">코딩애플 React 강의</a></div>
                <div className="book-node">📚 추천 책: 『리액트를 다루는 기술』 (김민준 저), 『혼자 공부하는 머신러닝+딥러닝』 (박해선 저)</div>
              </div>
              {/* 주요 라이브러리/도구 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('beginner-tools')}
              >
                주요 라이브러리/도구 {getIcon(!!expandedSubBranches['beginner-tools'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['beginner-tools'] ? ' expanded' : '')
                }
                id="beginner-tools"
                style={{ display: expandedSubBranches['beginner-tools'] ? 'block' : 'none' }}
              >
                <div className="detail-node">Node.js &amp; npm/yarn: React 개발 환경 구축 및 패키지 관리</div>
                <div className="detail-node">Create React App / Vite: React 프로젝트를 빠르게 시작하는 도구</div>
                <div className="resource-node">📄 <a href="https://nodejs.org/ko/docs" target="_blank" rel="noopener noreferrer">Node.js 공식 문서</a></div>
                <div className="resource-node">📄 <a href="https://create-react-app.dev/docs/getting-started/" target="_blank" rel="noopener noreferrer">Create React App 공식 문서</a></div>
                <div className="resource-node">📄 <a href="https://vitejs.dev/guide/" target="_blank" rel="noopener noreferrer">Vite 공식 문서</a></div>
              </div>
            </div>
          </div>

          {/* 중급 (Intermediate) */}
          <div className="branch">
            <div
              className="level-node intermediate"
              onClick={() => toggleBranch('intermediate')}
            >
              중급 (Intermediate) {getIcon(!!expandedBranches['intermediate'])}
            </div>
            <div
              className={
                'sub-branches' + (expandedBranches['intermediate'] ? ' expanded' : '')
              }
              id="intermediate"
              style={{ display: expandedBranches['intermediate'] ? 'block' : 'none' }}
            >
              {/* 핵심 개념 및 기술 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('intermediate-concepts')}
              >
                핵심 개념 및 기술 {getIcon(!!expandedSubBranches['intermediate-concepts'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['intermediate-concepts'] ? ' expanded' : '')
                }
                id="intermediate-concepts"
                style={{ display: expandedSubBranches['intermediate-concepts'] ? 'block' : 'none' }}
              >
                <div className="detail-node">Hooks 심화: 더 복잡한 상태 및 사이드 이펙트 관리</div>
                <div className="detail-node">• useEffect: 사이드 이펙트(데이터 가져오기, DOM 조작 등) 처리</div>
                <div className="detail-node">• useRef: DOM 요소 접근, 렌더링과 무관한 값 유지</div>
                <div className="detail-node">• useMemo / useCallback: 성능 최적화를 위한 훅</div>
                <div className="detail-node">• useReducer: 복잡한 상태 로직 관리에 유용</div>
                <div className="detail-node">• useContext: 전역적인 상태 관리를 위한 훅</div>
                <div className="resource-node">📖 <a href="https://ko.react.dev/reference/react" target="_blank" rel="noopener noreferrer">React Hooks 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=G3qglTF-fFI" target="_blank" rel="noopener noreferrer">드림코딩 React Hooks</a></div>
                <div className="detail-node">React Router: SPA에서 라우팅(페이지 이동)을 구현하는 표준 라이브러리. `BrowserRouter`, `Routes`, `Route`, `Link` 등</div>
                <div className="resource-node">📄 <a href="https://reactrouter.com/en/main" target="_blank" rel="noopener noreferrer">React Router 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=CHHXeHVK-8U" target="_blank" rel="noopener noreferrer">벨로퍼트 React Router</a></div>
                <div className="detail-node">상태 관리 라이브러리: 복잡하고 큰 규모의 앱을 위한 상태 관리</div>
                <div className="detail-node">• Redux (또는 Redux Toolkit): 예측 가능한 상태 관리를 위한 라이브러리 (Actions, Reducers, Store)</div>
                <div className="detail-node">• Context API: 간단한 전역 상태 관리에 사용</div>
                <div className="detail-node">• 기타: Zustand, Recoil, Jotai (Redux보다 가볍고 사용하기 쉬운 대안)</div>
                <div className="resource-node">📖 <a href="https://redux.js.org/introduction/getting-started" target="_blank" rel="noopener noreferrer">Redux 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=QZcYz2NrPIs" target="_blank" rel="noopener noreferrer">벨로퍼트 Redux 강의</a></div>
                <div className="resource-node">📄 <a href="https://redux-toolkit.js.org/" target="_blank" rel="noopener noreferrer">Redux Toolkit 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=9DU7wZr5bdA" target="_blank" rel="noopener noreferrer">드림코딩 Redux Toolkit</a></div>
                <div className="detail-node">비동기 처리: `fetch` API 또는 `Axios`를 사용하여 서버에서 데이터 가져오기</div>
                <div className="detail-node">커스텀 훅 (Custom Hooks): 반복되는 로직을 재사용 가능한 훅으로 만들기</div>
                <div className="detail-node">성능 최적화 기초: `React.memo` 활용</div>
                <div className="detail-node">React Life Cycle 이해: 컴포넌트 생명주기 메서드 및 `useEffect`로 생명주기 동작 시뮬레이션</div>
                <div className="book-node">📚 추천 책: 『리액트를 다루는 기술』 (김민준 저), 『모던 리액트 Deep Dive』 (김용찬 저)</div>
              </div>
              {/* 주요 라이브러리/도구 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('intermediate-tools')}
              >
                주요 라이브러리/도구 {getIcon(!!expandedSubBranches['intermediate-tools'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['intermediate-tools'] ? ' expanded' : '')
                }
                id="intermediate-tools"
                style={{ display: expandedSubBranches['intermediate-tools'] ? 'block' : 'none' }}
              >
                <div className="detail-node">React Router v6+</div>
                <div className="detail-node">Redux / Redux Toolkit</div>
                <div className="detail-node">Axios</div>
                <div className="detail-node">ESLint, Prettier: 코드 품질 유지 및 일관된 코드 스타일 적용</div>
              </div>
            </div>
          </div>

          {/* 고급 (Advanced) */}
          <div className="branch">
            <div
              className="level-node advanced"
              onClick={() => toggleBranch('advanced')}
            >
              고급 (Advanced) {getIcon(!!expandedBranches['advanced'])}
            </div>
            <div
              className={
                'sub-branches' + (expandedBranches['advanced'] ? ' expanded' : '')
              }
              id="advanced"
              style={{ display: expandedBranches['advanced'] ? 'block' : 'none' }}
            >
              {/* TypeScript */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('typescript')}
              >
                TypeScript {getIcon(!!expandedSubBranches['typescript'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['typescript'] ? ' expanded' : '')
                }
                id="typescript"
                style={{ display: expandedSubBranches['typescript'] ? 'block' : 'none' }}
              >
                <div className="detail-node">TypeScript: JavaScript에 정적 타입을 추가하여 코드 안정성과 가독성 향상</div>
                <div className="detail-node">React와 TypeScript 연동: 대규모 프로젝트에서 필수적</div>
                <div className="resource-node">📖 <a href="https://www.typescriptlang.org/ko/" target="_blank" rel="noopener noreferrer">TypeScript 공식 문서 (한국어)</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=BwuLxPH8IDs" target="_blank" rel="noopener noreferrer">드림코딩 TypeScript 기초</a></div>
                <div className="resource-node">📄 <a href="https://typescript-kr.github.io/" target="_blank" rel="noopener noreferrer">TypeScript 한국어 가이드</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=0yWAtQ6wYNM" target="_blank" rel="noopener noreferrer">코딩애플 TypeScript 강의</a></div>
                <div className="resource-node">📖 <a href="https://react.vlpt.us/using-typescript/" target="_blank" rel="noopener noreferrer">벨로퍼트 React + TypeScript</a></div>
              </div>
              {/* 프레임워크 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('frameworks')}
              >
                프레임워크 {getIcon(!!expandedSubBranches['frameworks'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['frameworks'] ? ' expanded' : '')
                }
                id="frameworks"
                style={{ display: expandedSubBranches['frameworks'] ? 'block' : 'none' }}
              >
                <div className="detail-node">Next.js / Remix: React 기반의 풀스택 프레임워크</div>
                <div className="detail-node">SSR, SSG, ISR (렌더링 방식): SEO 개선 및 초기 로딩 성능 향상</div>
                <div className="detail-node">API 라우트: 백엔드 API 기능 내장</div>
                <div className="detail-node">데이터 페칭 전략: 다양한 데이터 로딩 방식 이해</div>
                <div className="resource-node">📖 <a href="https://nextjs.org/ko/docs" target="_blank" rel="noopener noreferrer">Next.js 공식 문서 (한국어)</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=1zV1x4VqR8g" target="_blank" rel="noopener noreferrer">드림코딩 Next.js 기초</a></div>
                <div className="resource-node">📄 <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">Vercel 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=6aP9nyTcd44" target="_blank" rel="noopener noreferrer">노마드코더 Next.js 강의</a></div>
                <div className="resource-node">📖 <a href="https://remix.run/docs/en/main" target="_blank" rel="noopener noreferrer">Remix 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=0yWAtQ6wYNM" target="_blank" rel="noopener noreferrer">코딩애플 Next.js 강의</a></div>
                <div className="book-node">📚 추천 책: 『실전 Next.js』 (김정환 저)</div>
              </div>
              {/* 테스팅 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('testing')}
              >
                테스팅 {getIcon(!!expandedSubBranches['testing'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['testing'] ? ' expanded' : '')
                }
                id="testing"
                style={{ display: expandedSubBranches['testing'] ? 'block' : 'none' }}
              >
                <div className="detail-node">단위 테스트 (Jest, React Testing Library): 개별 컴포넌트나 함수 테스트</div>
                <div className="detail-node">통합 테스트: 여러 컴포넌트 또는 모듈이 함께 작동하는지 테스트</div>
                <div className="detail-node">E2E 테스트 (Cypress, Playwright 개념): 사용자 시나리오 전체 흐름 테스트</div>
                <div className="resource-node">📖 <a href="https://testing-library.com/docs/react-testing-library/intro/" target="_blank" rel="noopener noreferrer">React Testing Library 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=GLSSRtnNY0g" target="_blank" rel="noopener noreferrer">드림코딩 React 테스팅</a></div>
                <div className="resource-node">📄 <a href="https://jestjs.io/ko/" target="_blank" rel="noopener noreferrer">Jest 공식 문서 (한국어)</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=7dTTFW7yACQ" target="_blank" rel="noopener noreferrer">벨로퍼트 React 테스팅</a></div>
                <div className="resource-node">📖 <a href="https://docs.cypress.io/" target="_blank" rel="noopener noreferrer">Cypress 공식 문서</a></div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/watch?v=0yWAtQ6wYNM" target="_blank" rel="noopener noreferrer">코딩애플 테스팅 강의</a></div>
              </div>
              {/* 고급 심화 개념 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('advanced-concepts')}
              >
                핵심 개념 및 기술 (고급 심화) {getIcon(!!expandedSubBranches['advanced-concepts'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['advanced-concepts'] ? ' expanded' : '')
                }
                id="advanced-concepts"
                style={{ display: expandedSubBranches['advanced-concepts'] ? 'block' : 'none' }}
              >
                <div className="detail-node">성능 최적화 심화: 번들 최적화, 이미지 최적화, 코드 스플리팅, 웹 워커 (개념)</div>
                <div className="detail-node">상태 관리 심화: TanStack Query (React Query) 등 비동기 상태 관리 라이브러리 활용</div>
                <div className="resource-node">📖 <a href="https://tanstack.com/query/latest/docs/react/overview" target="_blank" rel="noopener noreferrer">TanStack Query 공식 문서</a></div>
                <div className="book-node">📚 추천 책: 『React Query 완벽 가이드』 (강대명 저)</div>
                <div className="detail-node">컴포넌트 디자인 시스템 (Storybook): 재사용 가능한 UI 컴포넌트 개발 및 문서화</div>
                <div className="resource-node">📖 <a href="https://storybook.js.org/docs/react/get-started/introduction" target="_blank" rel="noopener noreferrer">Storybook 공식 문서</a></div>
                <div className="detail-node">웹 접근성 (Web Accessibility): 모든 사용자가 웹 콘텐츠에 동등하게 접근할 수 있도록 하는 방법</div>
                <div className="resource-node">📄 <a href="https://developer.mozilla.org/ko/docs/Web/Accessibility" target="_blank" rel="noopener noreferrer">MDN 웹 접근성 가이드</a></div>
                <div className="detail-node">애플리케이션 배포 (Deployment): Vercel, Netlify, AWS Amplify 등 서비스를 이용한 배포</div>
                <div className="resource-node">📄 <a href="https://vercel.com/docs/deployments" target="_blank" rel="noopener noreferrer">Vercel 배포 가이드</a></div>
                <div className="resource-node">📄 <a href="https://docs.netlify.com/get-started/" target="_blank" rel="noopener noreferrer">Netlify 시작 가이드</a></div>
                <div className="detail-node">Node.js & 백엔드 이해: API 연동 및 풀스택 개발에 대한 이해</div>
              </div>
              {/* 주요 라이브러리/도구 (고급) */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('advanced-tools')}
              >
                주요 라이브러리/도구 (고급) {getIcon(!!expandedSubBranches['advanced-tools'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['advanced-tools'] ? ' expanded' : '')
                }
                id="advanced-tools"
                style={{ display: expandedSubBranches['advanced-tools'] ? 'block' : 'none' }}
              >
                <div className="detail-node">TypeScript</div>
                <div className="detail-node">Next.js / Remix</div>
                <div className="detail-node">Jest, React Testing Library</div>
                <div className="detail-node">TanStack Query (React Query)</div>
                <div className="detail-node">Storybook</div>
                <div className="detail-node">Cypress / Playwright</div>
              </div>
            </div>
          </div>

          {/* 커뮤니티 (Community) */}
          <div className="branch">
            <div
              className="level-node community"
              onClick={() => toggleBranch('community')}
            >
              추천 커뮤니티 {getIcon(!!expandedBranches['community'])}
            </div>
            <div
              className={
                'sub-branches' + (expandedBranches['community'] ? ' expanded' : '')
              }
              id="community"
              style={{ display: expandedBranches['community'] ? 'block' : 'none' }}
            >
              {/* 국내 온라인 커뮤니티/카페 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('korea-community')}
              >
                국내 온라인 커뮤니티/카페 {getIcon(!!expandedSubBranches['korea-community'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['korea-community'] ? ' expanded' : '')
                }
                id="korea-community"
                style={{ display: expandedSubBranches['korea-community'] ? 'block' : 'none' }}
              >
                <div className="resource-node">🔗 <a href="https://www.facebook.com/groups/react.ko/" target="_blank" rel="noopener noreferrer">React Korea (페이스북 그룹):</a> 한국 React 개발자들의 활발한 교류 공간</div>
                <div className="resource-node">🔗 <a href="https://velopert.com/" target="_blank" rel="noopener noreferrer">벨로퍼트 개발자 커뮤니티:</a> React 관련 질문 및 답변, 블로그 연계</div>
                <div className="resource-node">🔗 <a href="https://cafe.naver.com/codinguniv" target="_blank" rel="noopener noreferrer">네이버 카페 '생활코딩':</a> 웹 개발 전반, React 초보자에게 친숙</div>
                <div className="resource-node">🔗 <a href="https://cafe.naver.com/frontendcafe" target="_blank" rel="noopener noreferrer">네이버 카페 '프론트엔드 개발자 모임':</a> 프론트엔드 심화 논의</div>
                <div className="resource-node">🔗 <a href="https://developers.google.com/community/gdsc" target="_blank" rel="noopener noreferrer">GDSC (Google Developers Student Clubs):</a> 대학생 개발자 커뮤니티, 스터디/프로젝트</div>
              </div>
              {/* 해외 온라인 커뮤니티/포럼 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('global-community')}
              >
                해외 온라인 커뮤니티/포럼 {getIcon(!!expandedSubBranches['global-community'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['global-community'] ? ' expanded' : '')
                }
                id="global-community"
                style={{ display: expandedSubBranches['global-community'] ? 'block' : 'none' }}
              >
                <div className="resource-node">🔗 <a href="https://stackoverflow.com/questions/tagged/reactjs" target="_blank" rel="noopener noreferrer">Stack Overflow:</a> 프로그래밍 질문/답변의 가장 큰 허브</div>
                <div className="resource-node">🔗 <a href="https://www.reddit.com/r/reactjs/" target="_blank" rel="noopener noreferrer">Reddit (r/reactjs):</a> React 전용 서브레딧, 최신 소식/트렌드</div>
                <div className="resource-node">🔗 <a href="https://discord.gg/reactiflux" target="_blank" rel="noopener noreferrer">Discord/Slack 채널 (Reactiflux 등):</a> 공식 및 비공식 커뮤니티, 실시간 질의응답</div>
              </div>
              {/* 유튜브 채널 */}
              <div
                className="sub-node"
                onClick={() => toggleSubBranch('youtube')}
              >
                유튜브 채널 {getIcon(!!expandedSubBranches['youtube'])}
              </div>
              <div
                className={
                  'sub-branches' +
                  (expandedSubBranches['youtube'] ? ' expanded' : '')
                }
                id="youtube"
                style={{ display: expandedSubBranches['youtube'] ? 'block' : 'none' }}
              >
                <div className="resource-node">🎥 <a href="https://www.youtube.com/@dreamcoding" target="_blank" rel="noopener noreferrer">드림코딩 by 엘리:</a> React 포함 웹 개발 전반 양질의 한국어 강의</div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/@codingapple" target="_blank" rel="noopener noreferrer">코딩애플:</a> 실용적인 React 프로젝트 및 설명 (한국어)</div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/@nomadcoders" target="_blank" rel="noopener noreferrer">노마드 코더스:</a> React 및 다양한 프론트엔드 기술 실전 강의</div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/@react" target="_blank" rel="noopener noreferrer">React (Official Channel):</a> React 공식 팀 채널, 최신 업데이트/컨퍼런스</div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/@GoogleDevelopersKorea" target="_blank" rel="noopener noreferrer">Google Developers Korea:</a> 구글 개발자 소식 및 기술 튜토리얼</div>
                <div className="resource-node">🎥 <a href="https://www.youtube.com/@velopert" target="_blank" rel="noopener noreferrer">벨로퍼트:</a> React 관련 강의 및 튜토리얼</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
} 