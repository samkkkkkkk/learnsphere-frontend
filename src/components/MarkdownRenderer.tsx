import React, { Suspense } from 'react';
import './MarkdownRenderer.css';

// react-markdown + Prism 하이라이터는 무거워서(수백 kB) 지연 로드한다.
// 전역 챗 위젯이 이 컴포넌트를 쓰므로, 직접 임포트하면 초기 청크에 포함된다.
const MarkdownContent = React.lazy(() => import('./MarkdownContent'));

interface MarkdownRendererProps {
  children: string;
}

/**
 * 마크다운 + 코드 하이라이팅 렌더러 (지연 로드 파사드).
 *
 * 레슨 상세(ReactLearnPage)·LMS 강의·튜터 챗이 같은 렌더링 규칙을 쓰도록 공유한다.
 * 로드되는 짧은 순간에는 원문 텍스트를 그대로 보여준다.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => (
  <Suspense fallback={<div className="md-plain">{children}</div>}>
    <MarkdownContent>{children}</MarkdownContent>
  </Suspense>
);

export default MarkdownRenderer;
