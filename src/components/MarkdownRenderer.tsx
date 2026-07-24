import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  children: string;
}

// react-markdown이 code 렌더러에 넘기는 props. className으로 언어를 구분한다.
type CodeProps = React.ComponentPropsWithoutRef<'code'>;

/**
 * 마크다운 + 코드 하이라이팅 렌더러.
 *
 * 레슨 상세(ReactLearnPage)와 튜터 챗이 같은 렌더링 규칙을 쓰도록 공유한다.
 * 블록 코드는 Prism으로 하이라이팅하고, 인라인 코드는 그대로 둔다.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ className, children, ...props }: CodeProps) {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match;
        return !isInline ? (
          <SyntaxHighlighter
            style={tomorrow}
            language={match?.[1] || 'javascript'}
            PreTag="div"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {children}
  </ReactMarkdown>
);

export default MarkdownRenderer;
