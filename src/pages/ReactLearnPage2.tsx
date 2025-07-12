import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ReactLearnPage2.css';

// API 응답 데이터의 타입을 정의합니다.
type Lesson = {
  title: string;
  content: string;
};

/**
 * React 학습 자료 생성기 메인 UI 컴포넌트
 */
export default function ReactLearn() {
  // 컴포넌트의 상태 관리
  const [level, setLevel] = useState<'초급' | '중급' | '고급'>('초급');
  const [lessons, setLessons] = useState<Lesson[]>([]); // 여러 학습 자료를 저장할 배열
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null); // 열린 아코디언 항목의 title을 저장
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set()); // 정답을 보여줄 퀴즈들을 추적

  /**
   * 폼 제출 시 호출되는 이벤트 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setLessons([]); // 이전 목록을 초기화
    setOpenAccordion(null); // 아코디언 상태 초기화

    try {
      // 새로운 API 엔드포인트 호출
      const response = await axios.post('http://localhost:8000/api/generate-topic-lessons', {
        level,
      });
      setLessons(response.data.lessons);
    } catch (err) {
      setError('학습 자료를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 아코디언 항목을 열고 닫는 함수
   * @param title 토글할 항목의 제목
   */
  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

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

  return (
    <div className="react-learn2-container">
      <header className="react-learn2-header">
        <h1>React RAG 학습 도우미 🧠</h1>
        <p>React 공식 문서를 기반으로 맞춤형 학습 자료를 생성합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="react-learn2-form-container">
        <div className="react-learn2-form-group">
          <label htmlFor="level-select">학습 수준 선택</label>
          <select
            id="level-select"
            value={level}
            onChange={(e) => setLevel(e.target.value as '초급' | '중급' | '고급')}
          >
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>
        </div>
        {/* 질문 입력창은 제거되었습니다. */}
        <button type="submit" className="react-learn2-submit-btn" disabled={isLoading}>
          {isLoading ? '생성 중...' : `${level} 레벨 전체 학습자료 생성하기 ✨`}
        </button>
      </form>

      {error && <div className="react-learn2-error-message">{error}</div>}

      <main className="react-learn2-lesson-container">
        {isLoading && (
          <div className="react-learn2-loading-container">
            <div className="react-learn2-loading-spinner"></div>
            <p>{level} 레벨의 전체 주제에 대한 학습 자료를 생성하고 있습니다...</p>
          </div>
        )}
        {/* 생성된 학습 자료 목록을 아코디언 형태로 렌더링 */}
        <div className="react-learn2-accordion-container">
          {lessons.map((lesson, index) => (
            <div key={index} className="react-learn2-accordion-item">
              <button className="react-learn2-accordion-title" onClick={() => toggleAccordion(lesson.title)}>
                {lesson.title}
                <span className={`react-learn2-accordion-icon ${openAccordion === lesson.title ? 'open' : ''}`}>▼</span>
              </button>
              {openAccordion === lesson.title && (
                <div className="react-learn2-accordion-content">
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
                
                // 디버깅: 퀴즈 관련 텍스트 출력
                if (text.includes('문제') || text.includes('정답') || text.includes('Quiz')) {
                  console.log('퀴즈 관련 텍스트:', text);
                }
                
                // 퀴즈 문제 패턴 매칭 (예: "1. **문제**: ...")
                const quizProblemMatch = text.match(/^(\d+)\.\s*\*\*문제\*\*:\s*(.+)$/);
                if (quizProblemMatch) {
                  console.log('퀴즈 문제 매칭됨:', quizProblemMatch);
                  const quizNumber = quizProblemMatch[1];
                  const question = quizProblemMatch[2];
                  const quizId = `${lesson.title}-quiz-${quizNumber}`;
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
                  console.log('퀴즈 정답 매칭됨:', quizAnswerMatch);
                  const answer = quizAnswerMatch[1];
                  // 현재 퀴즈 번호를 찾기 위해 이전 형제 요소 확인
                  const quizId = Array.from(showAnswers).find(id => 
                    id.includes(lesson.title) && showAnswers.has(id)
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
                    {lesson.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
