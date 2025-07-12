import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ReactLearnPage3.css';

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
    setShowAnswers(new Set()); // 정답 상태 초기화

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

  /**
   * 퀴즈 섹션을 파싱하고 렌더링하는 함수
   */
  const renderQuizSection = (content: string, lessonTitle: string) => {
    const quizSectionMatch = content.match(/### 📝 Quiz\n([\s\S]*?)(?=\n## |\n### |$)/);
    
    if (quizSectionMatch) {
      const quizSection = quizSectionMatch[1];
      console.log('퀴즈 섹션 발견:', quizSection);
      
      // 퀴즈 문제들을 파싱 - 개선된 방법
      const quizBlocks = quizSection.split(/(?=\d+\.\s*\*\*문제\*\*:)/);
      const quizzes = [];
      
      for (let i = 1; i < quizBlocks.length; i++) { // 0번째는 빈 문자열이므로 1부터 시작
        const block = quizBlocks[i];
        
        // 문제와 정답을 분리
        const problemMatch = block.match(/(\d+)\.\s*\*\*문제\*\*:\s*(.+?)(?=\n\s*\*\*정답\*\*:)/s);
        const answerMatch = block.match(/\*\*정답\*\*:\s*(.+)/s);
        
        if (problemMatch && answerMatch) {
          const quizNumber = problemMatch[1];
          const question = problemMatch[2].trim();
          const answer = answerMatch[1].trim();
          const quizId = `${lessonTitle}-quiz-${quizNumber}`;
          const isAnswerVisible = showAnswers.has(quizId);
          
          console.log(`퀴즈 ${quizNumber}:`, { question, answer, quizId, isAnswerVisible });
          
          quizzes.push(
            <div key={quizId} className="quiz-item">
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
                <div className="quiz-answer-content">
                  {answer}
                </div>
              )}
            </div>
          );
        }
      }
      
      if (quizzes.length > 0) {
        // 퀴즈 섹션을 제외한 나머지 콘텐츠 렌더링
        const contentWithoutQuiz = content.replace(/### 📝 Quiz\n[\s\S]*?(?=\n## |\n### |$)/, '');
        
        return (
          <>
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
              }}
            >
              {contentWithoutQuiz}
            </ReactMarkdown>
            <h3>📝 Quiz</h3>
            {quizzes}
          </>
        );
      }
    }
    
    // 퀴즈 섹션이 없거나 파싱에 실패한 경우 일반 렌더링
    return (
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
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="react-learn3-container">
      <header className="react-learn3-header">
        <h1>React RAG 학습 도우미 🧠</h1>
        <p>React 공식 문서를 기반으로 맞춤형 학습 자료를 생성합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="react-learn3-form-container">
        <div className="react-learn3-form-group">
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
        <button type="submit" className="react-learn3-submit-btn" disabled={isLoading}>
          {isLoading ? '생성 중...' : `${level} 레벨 전체 학습자료 생성하기 ✨`}
        </button>
      </form>

      {error && <div className="react-learn3-error-message">{error}</div>}

      <main className="react-learn3-lesson-container">
        {isLoading && (
          <div className="react-learn3-loading-container">
            <div className="react-learn3-loading-spinner"></div>
            <p>{level} 레벨의 전체 주제에 대한 학습 자료를 생성하고 있습니다...</p>
          </div>
        )}
        
        {/* 생성된 학습 자료 목록을 아코디언 형태로 렌더링 */}
        <div className="react-learn3-accordion-container">
          {lessons.map((lesson, index) => (
            <div key={index} className="react-learn3-accordion-item">
              <button 
                className="react-learn3-accordion-title" 
                onClick={() => toggleAccordion(lesson.title)}
              >
                {lesson.title}
                <span className={`react-learn3-accordion-icon ${openAccordion === lesson.title ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {openAccordion === lesson.title && (
                <div className="react-learn3-accordion-content">
                  {renderQuizSection(lesson.content, lesson.title)}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 