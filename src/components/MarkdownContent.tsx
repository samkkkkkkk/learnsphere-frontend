import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import cssLang from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

// 전체 Prism 빌드(전 언어, 수백 kB) 대신 라이트 빌드 + 콘텐츠에 실제 쓰이는 언어만 등록
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('html', markup);
SyntaxHighlighter.registerLanguage('css', cssLang);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cs', csharp);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('json', json);

interface MarkdownContentProps {
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
 * 마크다운 + 코드 하이라이팅 실제 구현.
 *
 * react-markdown·Prism이 무거워 초기 번들에서 제외하기 위해
 * MarkdownRenderer(파사드)가 이 컴포넌트를 lazy 로드한다.
 * 직접 임포트하지 말고 MarkdownRenderer를 사용할 것.
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({ children }) => (
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

export default MarkdownContent;
