import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ReactLearnPage4.css';

// API 응답 데이터의 타입을 정의합니다.
type Lesson = {
  title: string;
  filename: string;
  number: number;
};

type CodeExample = {
  description: string;
  code: string;
};

type LessonContent = {
  title: string;
  level: string;
  core_concepts: string;
  code_examples: CodeExample[] | string | Record<string, any>;
  quizzes: Array<{
    question: string;
    answer: string;
  }>;
};

/**
 * React 학습 자료 생성기 - JSON 파일 기반 버전
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
  const [selectedLessonContent, setSelectedLessonContent] = useState<LessonContent | null>(null);

  /**
   * 레벨 변경 시 학습 자료 로드
   */
  useEffect(() => {
    if (level) {
      loadLessons(level);
    }
  }, [level]);

  /**
   * 학습 자료 로드 함수
   */
  const loadLessons = async (selectedLevel: string) => {
    setIsLoading(true);
    setError(null);
    setLessons([]);
    setSelectedTopic(null);
    setSelectedLessonContent(null);
    setShowAnswers(new Set());
    setCompletedTopics(new Set());

    try {
      const response = await axios.get(`http://localhost:8000/api/lessons/${selectedLevel}`);
      setLessons(response.data.lessons);
      
      // 첫 번째 토픽을 자동으로 선택
      if (response.data.lessons.length > 0) {
        const firstLesson = response.data.lessons[0];
        setSelectedTopic(firstLesson.title);
        await loadLessonContent(firstLesson.filename);
      }
    } catch (err) {
      setError('학습 자료를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 학습 자료 내용 로드 함수
   */
  const loadLessonContent = async (filename: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/lesson/${filename}`);
      setSelectedLessonContent(response.data);
    } catch (err) {
      console.error('학습 자료 내용 로드 실패:', err);
      setSelectedLessonContent(null);
    }
  };

  /**
   * 토픽 선택 함수
   */
  const handleTopicSelect = async (lesson: Lesson) => {
    setSelectedTopic(lesson.title);
    await loadLessonContent(lesson.filename);
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
   * JSON 데이터를 Markdown으로 변환하는 함수
   */
  const renderLessonContent = (lessonContent: LessonContent) => {
    // 코드 예시 처리 - 다양한 타입 처리
    let codeExamplesText = '';
    
    if (Array.isArray(lessonContent.code_examples)) {
      // 배열인 경우
      const processedExamples = lessonContent.code_examples.map((example: CodeExample, index: number) => {
        const title = example.description;
        const codeContent = example.code;
        
        // 코드 블록이 이미 마크다운 형식인지 확인
        if (codeContent.includes('```')) {
          return `**${title}**\n${codeContent}`;
        } else {
          return `**${title}**\n\`\`\`javascript\n${codeContent}\n\`\`\``;
        }
      });
      
      codeExamplesText = processedExamples.join('\n\n');
    } else if (typeof lessonContent.code_examples === 'string') {
      // 문자열인 경우 - 코드 블록으로 변환
      const codeContent = lessonContent.code_examples.trim();
      
      // 이미 마크다운 코드 블록인지 확인
      if (codeContent.startsWith('```') && codeContent.endsWith('```')) {
        codeExamplesText = codeContent;
      } else {
        // 일반 텍스트를 코드 블록으로 변환
        codeExamplesText = `\`\`\`javascript\n${codeContent}\n\`\`\``;
      }
    } else if (typeof lessonContent.code_examples === 'object' && lessonContent.code_examples !== null) {
      // 객체인 경우
      const examples = Object.entries(lessonContent.code_examples);
      const processedExamples = examples.map(([key, value], index) => {
        const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        let codeContent = '';
        if (typeof value === 'string') {
          codeContent = value;
        } else if (Array.isArray(value)) {
          codeContent = value.join('\n');
        } else if (typeof value === 'object' && value !== null) {
          // 중첩된 객체 처리
          if (value.code) {
            if (Array.isArray(value.code)) {
              codeContent = value.code.join('\n');
            } else if (typeof value.code === 'string') {
              codeContent = value.code;
            }
          } else if (value.explanation) {
            codeContent = value.explanation;
          } else {
            codeContent = JSON.stringify(value, null, 2);
          }
        } else {
          codeContent = String(value);
        }
        
        // 코드 블록이 이미 마크다운 형식인지 확인
        if (codeContent.includes('```')) {
          return `**${title}**\n${codeContent}`;
        } else {
          return `**${title}**\n\`\`\`javascript\n${codeContent}\n\`\`\``;
        }
      });
      
      codeExamplesText = processedExamples.join('\n\n');
    } else {
      // 기본 코드 예시
      codeExamplesText = `\`\`\`javascript\n// ${lessonContent.title} 관련 코드 예시\nfunction Example() {\n  return (\n    <div>\n      <h1>예시 컴포넌트</h1>\n    </div>\n  );\n}\n\`\`\``;
    }

    const markdownContent = `## 🚀 ${lessonContent.title} 마스터하기 (${lessonContent.level})

### 📘 Core Concepts
${lessonContent.core_concepts}

### 💻 Code Examples
${codeExamplesText}`;

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
          {markdownContent}
        </ReactMarkdown>
        
        {/* 퀴즈 섹션 별도 렌더링 */}
        <div className="quiz-section">
          <h3>📝 Quiz</h3>
          {lessonContent.quizzes.map((quiz, index) => {
            const quizId = `${lessonContent.title}-quiz-${index + 1}`;
            const isAnswerVisible = showAnswers.has(quizId);
            
            return (
              <div key={quizId} className="quiz-item">
                <div className="quiz-question">
                  <span className="quiz-number">{index + 1}.</span>
                  <span className="quiz-text">{quiz.question}</span>
                  <button 
                    className="quiz-toggle-btn"
                    onClick={() => toggleAnswer(quizId)}
                  >
                    {isAnswerVisible ? '정답 숨기기' : '정답 보기'}
                  </button>
                </div>
                {isAnswerVisible && (
                  <div className="quiz-answer-content">
                    {quiz.answer}
                  </div>
                )}
              </div>
            );
          })}
          <button 
            className="complete-topic-btn"
            onClick={() => markTopicCompleted(lessonContent.title)}
          >
            ✅ 이 토픽 완료하기
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="react-learn4-container">
      <header className="react-learn4-header">
        <h1>React RAG 학습 도우미 🧠</h1>
        <p>React 공식 문서를 기반으로 맞춤형 학습 자료를 제공합니다.</p>
      </header>

      <div className="react-learn4-form-container">
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
      </div>

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
                  onClick={() => handleTopicSelect(lesson)}
                >
                  <span className="topic-number">{lesson.number}</span>
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
            {selectedLessonContent ? (
              <div className="content-container">
                <div className="content-header">
                  <h2>{selectedLessonContent.title}</h2>
                  <div className="content-actions">
                    <button 
                      className="action-btn"
                      onClick={() => {
                        const lesson = lessons.find(l => l.title === selectedTopic);
                        if (lesson) {
                          window.open(`http://localhost:8000/api/lesson/${lesson.filename}`, '_blank');
                        }
                      }}
                    >
                      📄 JSON 보기
                    </button>
                  </div>
                </div>
                <div className="content-body">
                  {renderLessonContent(selectedLessonContent)}
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