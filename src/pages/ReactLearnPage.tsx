import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ReactLearnPage.css';

// 학습 수준을 위한 타입 정의
type Level = '초급' | '중급' | '고급';

/**
 * React 학습 자료 생성기 메인 UI 컴포넌트
 */
export default function ReactLearn() {
  // 컴포넌트의 상태 관리
  const [level, setLevel] = useState<Level>('초급');
  const [query, setQuery] = useState<string>('React의 State란 무엇인가요?');
  const [lesson, setLesson] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set()); // 정답을 보여줄 퀴즈들을 추적

  /**
   * 퀴즈 정답을 토글하는 함수
   * @param quizId 퀴즈 식별자
   */
  const toggleAnswer = (quizId: string) => {
    setShowAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
      }
      return newSet;
    });
  };

  /**
   * 폼 제출 시 호출되는 이벤트 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) {
      setError('질문을 입력해주세요!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLesson('');

    try {
      // FastAPI 백엔드 서버에 API 요청
      const response = await axios.post('http://localhost:8000/api/generate-lesson', {
        level,
        query,
      });
      setLesson(response.data.lesson);
    } catch (err) {
      setError('학습 자료를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="react-learn-container">
      <header className="react-learn-header">
        <h1>React RAG 학습 도우미 🧠</h1>
        <p>React 공식 문서를 기반으로 맞춤형 학습 자료를 생성합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="react-learn-form-container">
        <div className="react-learn-form-group">
          <label htmlFor="level-select">학습 수준</label>
          <select
            id="level-select"
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
          >
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>
        </div>
        <div className="react-learn-form-group">
          <label htmlFor="query-input">질문</label>
          <input
            id="query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 'useEffect 사용법 알려주세요'"
          />
        </div>
        <button type="submit" className="react-learn-submit-btn" disabled={isLoading}>
          {isLoading ? '생성 중...' : '학습 자료 생성하기 ✨'}
        </button>
      </form>

      {error && <div className="react-learn-error-message">{error}</div>}

      <main className="react-learn-lesson-container">
        {/* 로딩 중일 때 스피너 표시 */}
        {isLoading && (
          <div className="react-learn-loading-container">
            <div className="react-learn-loading-spinner"></div>
            <p>관련 문서를 찾고 학습 자료를 생성하고 있습니다...</p>
          </div>
        )}
        {/* 생성된 학습 자료(마크다운)를 렌더링 */}
        {lesson && (
          <ReactMarkdown
            components={{
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                return !isInline ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
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
              // 퀴즈 정답 토글을 위한 커스텀 컴포넌트
              p({ children, ...props }: any) {
                const text = String(children);
                
                // 퀴즈 문제 패턴 매칭 (예: "1. **문제**: ...")
                const quizProblemMatch = text.match(/^(\d+)\.\s*\*\*문제\*\*:\s*(.+)$/);
                if (quizProblemMatch) {
                  const quizNumber = quizProblemMatch[1];
                  const question = quizProblemMatch[2];
                  const quizId = `single-lesson-quiz-${quizNumber}`;
                  const isAnswerVisible = showAnswers.has(quizId);
                  
                  return (
                    <div className="quiz-item">
                      <div className="quiz-question">
                        <span className="quiz-number">{quizNumber}.</span>
                        <span className="quiz-text">{question}</span>
                        <button 
                          className="quiz-toggle-btn"
                          onClick={() => toggleAnswer(quizId)}
                        >
                          {isAnswerVisible ? '정답 숨기기' : '정답 보기'}
                        </button>
                      </div>
                      {isAnswerVisible && (
                        <div className="quiz-answer">
                          <strong>정답:</strong> {/* 정답 부분은 다음 요소에서 처리됨 */}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // 퀴즈 정답 패턴 매칭 (예: "**정답**: ...")
                const quizAnswerMatch = text.match(/^\*\*정답\*\*:\s*(.+)$/);
                if (quizAnswerMatch) {
                  const answer = quizAnswerMatch[1];
                  // 현재 퀴즈 번호를 찾기 위해 이전 형제 요소 확인
                  const quizId = Array.from(showAnswers).find(id => 
                    id.includes('single-lesson-quiz') && showAnswers.has(id)
                  );
                  
                  if (quizId && showAnswers.has(quizId)) {
                    return (
                      <div className="quiz-answer-content">
                        {answer}
                      </div>
                    );
                  }
                  return null; // 정답이 숨겨져 있으면 렌더링하지 않음
                }
                
                // 일반 텍스트는 그대로 렌더링
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {lesson}
          </ReactMarkdown>
        )}
      </main>
    </div>
  );
}
