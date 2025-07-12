import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ReactLearnPage4.css';

// API 응답 데이터의 타입을 정의합니다.
type Lesson = {
  title: string;
  content: string;
};

/**
 * React 학습 자료 생성기 - 개선된 UI/UX 버전
 */
export default function ReactLearn() {
  // 컴포넌트의 상태 관리
  const [level, setLevel] = useState<'초급' | '중급' | '고급'>('초급');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  /**
   * 폼 제출 시 호출되는 이벤트 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setLessons([]);
    setSelectedTopic(null);
    setShowAnswers(new Set());
    setCompletedTopics(new Set());

    try {
      const response = await axios.post('http://localhost:8000/api/generate-topic-lessons', {
        level,
      });
      setLessons(response.data.lessons);
      // 첫 번째 토픽을 자동으로 선택
      if (response.data.lessons.length > 0) {
        setSelectedTopic(response.data.lessons[0].title);
      }
    } catch (err) {
      setError('학습 자료를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 퀴즈 정답을 토글하는 함수
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
   * 토픽 완료 표시 함수
   */
  const markTopicCompleted = (topicTitle: string) => {
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      newSet.add(topicTitle);
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
      
      // 퀴즈 문제들을 파싱 - 개선된 방법
      const quizBlocks = quizSection.split(/(?=\d+\.\s*\*\*문제\*\*:)/);
      const quizzes = [];
      
      for (let i = 1; i < quizBlocks.length; i++) {
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
            <div className="quiz-section">
              <h3>📝 Quiz</h3>
              {quizzes}
              <button 
                className="complete-topic-btn"
                onClick={() => markTopicCompleted(lessonTitle)}
              >
                ✅ 이 토픽 완료하기
              </button>
            </div>
          </>
        );
      }
    }
    
    // 퀴즈 섹션이 없거나 파싱에 실패한 경우 일반 렌더링
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
          {content}
        </ReactMarkdown>
        <button 
          className="complete-topic-btn"
          onClick={() => markTopicCompleted(lessonTitle)}
        >
          ✅ 이 토픽 완료하기
        </button>
      </>
    );
  };

  const selectedLesson = lessons.find(lesson => lesson.title === selectedTopic);

  return (
    <div className="react-learn4-container">
      <header className="react-learn4-header">
        <h1>React RAG 학습 도우미 🧠</h1>
        <p>React 공식 문서를 기반으로 맞춤형 학습 자료를 생성합니다.</p>
      </header>

      <form onSubmit={handleSubmit} className="react-learn4-form-container">
        <div className="react-learn4-form-group">
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
        <button type="submit" className="react-learn4-submit-btn" disabled={isLoading}>
          {isLoading ? '로딩 중...' : `${level} 레벨 학습자료 불러오기 ✨`}
        </button>
      </form>

      {error && <div className="react-learn4-error-message">{error}</div>}

      {isLoading && (
        <div className="react-learn4-loading-container">
          <div className="react-learn4-loading-spinner"></div>
          <p>{level} 레벨의 학습 자료를 불러오고 있습니다...</p>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="react-learn4-main-layout">
          {/* 사이드바 - 토픽 네비게이션 */}
          <aside className="react-learn4-sidebar">
            <div className="sidebar-header">
              <h3>📚 학습 토픽</h3>
              <div className="progress-info">
                <span>진행률: {completedTopics.size}/{lessons.length}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(completedTopics.size / lessons.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <nav className="topic-navigation">
              {lessons.map((lesson, index) => (
                <button
                  key={index}
                  className={`topic-button ${selectedTopic === lesson.title ? 'active' : ''} ${
                    completedTopics.has(lesson.title) ? 'completed' : ''
                  }`}
                  onClick={() => setSelectedTopic(lesson.title)}
                >
                  <span className="topic-number">{index + 1}</span>
                  <span className="topic-title">{lesson.title}</span>
                  {completedTopics.has(lesson.title) && (
                    <span className="completion-icon">✅</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* 메인 콘텐츠 영역 */}
          <main className="react-learn4-content">
            {selectedLesson ? (
              <div className="content-container">
                <div className="content-header">
                  <h2>{selectedLesson.title}</h2>
                  <div className="content-actions">
                    <button 
                      className="action-btn"
                      onClick={() => {
                        const url = `data:text/plain;charset=utf-8,${encodeURIComponent(selectedLesson.content)}`;
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${selectedLesson.title}.md`;
                        link.click();
                      }}
                    >
                      📥 다운로드
                    </button>
                  </div>
                </div>
                <div className="content-body">
                  {renderQuizSection(selectedLesson.content, selectedLesson.title)}
                </div>
              </div>
            ) : (
              <div className="no-topic-selected">
                <div className="empty-state">
                  <h3>🎯 학습할 토픽을 선택하세요</h3>
                  <p>왼쪽 사이드바에서 학습하고 싶은 토픽을 클릭하세요.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
} 