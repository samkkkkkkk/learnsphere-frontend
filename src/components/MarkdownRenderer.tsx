import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  children: string;
}

// react-markdown이 code 렌더러에 넘기는 props. className으로 언어를 구분한다.
type CodeProps = React.ComponentPropsWithoutRef<'code'>;

/** 코드 블록 — 언어 라벨 + 복사 버튼 */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근이 막힌 환경(http 등)에서는 조용히 무시
    }
  };

  return (
    <div className="md-codeblock">
      <div className="md-codeblock__bar">
        <span className="md-codeblock__lang">{language}</span>
        <button type="button" className="md-codeblock__copy" onClick={handleCopy}>
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>
      <SyntaxHighlighter
        style={tomorrow}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, background: 'var(--color-code-bg)' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * 마크다운 + 코드 하이라이팅 렌더러.
 *
 * 레슨 상세(ReactLearnPage)·LMS 강의·튜터 챗이 같은 렌더링 규칙을 쓰도록 공유한다.
 * 블록 코드는 Prism으로 하이라이팅하고 복사 버튼을 붙이며, 인라인 코드는 그대로 둔다.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ className, children, ...props }: CodeProps) {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match;
        return !isInline ? (
          <CodeBlock
            language={match?.[1] || 'javascript'}
            code={String(children).replace(/\n$/, '')}
          />
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
