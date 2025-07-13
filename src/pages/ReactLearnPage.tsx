import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchLessonIndex, fetchLessonDetail } from '../api/lessonApi';
import type { LessonContent, LessonIndex } from '../api/lessonApi';
import './ReactLearnPage.css';

// 학습 수준을 위한 타입 정의
type Level = '초급' | '중급' | '고급';

/**
 * React 학습 자료 생성기 메인 UI 컴포넌트
 */
export default function ReactLearn() {
  // 컴포넌트의 상태 관리
  const [level, setLevel] = useState<Level>('초급');
  const [lessonIndex, setLessonIndex] = useState<LessonIndex | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<(LessonContent & { filename: string }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set()); // 정답을 보여줄 퀴즈들을 추적
  const [showModal, setShowModal] = useState(false);

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  /**
   * 레슨 인덱스를 로드하는 함수
   */
  const loadLessonIndex = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const index = await fetchLessonIndex();
      setLessonIndex(index);
    } catch (err) {
      setError('레슨 목록을 불러오는데 실패했습니다.');
      console.error('레슨 인덱스 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 특정 레슨을 로드하는 함수
   */
  const loadLessonDetail = async (filename: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const lesson = await fetchLessonDetail(filename);
      setSelectedLesson(lesson);
    } catch (err) {
      setError('레슨 내용을 불러오는데 실패했습니다.');
      console.error('레슨 상세 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
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

  // 모달 열기 핸들러
  const handleOpenModal = () => {
    setShowModal(true);
  };
  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
  };

  /**
   * 컴포넌트 마운트 시 레슨 인덱스 로드
   */
  useEffect(() => {
    loadLessonIndex();
  }, []);
  
  /**
   * 레슨 인덱스가 로드되면 첫 번째 레슨을 자동으로 로드
   */
  useEffect(() => {
    if (lessonIndex && lessonIndex[level] && lessonIndex[level].length > 0 && !selectedLesson) {
      const firstLesson = lessonIndex[level][0];
      loadLessonDetail(firstLesson.filename);
    }
  }, [lessonIndex, level, selectedLesson]);

  /**
   * 레벨 변경 시 해당 레벨의 레슨 목록 표시 및 첫 번째 레슨 자동 로드
   */
  const handleLevelChange = (newLevel: Level) => {
    setLevel(newLevel);
    setSelectedLesson(null);
    
    // 레슨 인덱스가 로드되어 있고, 해당 레벨에 레슨이 있으면 첫 번째 레슨을 자동으로 로드
    if (lessonIndex && lessonIndex[newLevel] && lessonIndex[newLevel].length > 0) {
      const firstLesson = lessonIndex[newLevel][0];
      loadLessonDetail(firstLesson.filename);
    }
  };

  return (
    <div className="react-learn-container">
      <header className="react-learn-header">
        <h1>React 학습 자료 📚</h1>
        <p>AI가 생성한 React 학습 자료를 확인하고 학습하세요.</p>
      </header>

      <div className="react-learn-controls">
        <div className="level-selector">
          <label htmlFor="level-select">학습 수준</label>
          <select
            id="level-select"
            value={level}
            onChange={(e) => handleLevelChange(e.target.value as Level)}
          >
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>
        </div>
        <button
          className="modal-btn"
          onClick={handleOpenModal}
          disabled={!selectedLesson}
        >
          크게보기
        </button>
      </div>

      {error && <div className="react-learn-error-message">{error}</div>}

      <div className="react-learn-content">
        {/* 레슨 목록 */}
        <div className="lesson-list">
          <h3>{level} 레벨 레슨 목록</h3>
          {isLoading ? (
            <div className="loading-spinner">로딩 중...</div>
          ) : lessonIndex && lessonIndex[level] ? (
            <div className="lesson-grid">
              {lessonIndex[level].map((lesson, index) => (
                <div 
                  key={lesson.filename}
                  className={`lesson-card ${selectedLesson && selectedLesson.filename === lesson.filename ? 'active' : ''}`}
                  onClick={() => loadLessonDetail(lesson.filename)}
                >
                  <div className="lesson-number">{lesson.number}</div>
                  <div className="lesson-title">{lesson.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-lessons">
              {level} 레벨의 레슨이 없습니다. 관리자 패널에서 콘텐츠를 생성해주세요.
            </div>
          )}
        </div>

        {/* 선택된 레슨 상세 내용 */}
        {selectedLesson && (
          <div className="lesson-detail">
            <h2>{selectedLesson.title}</h2>
            <div className="lesson-level">레벨: {selectedLesson.level}</div>
            
            {/* 핵심 개념 */}
            <section className="lesson-section">
              <h3>핵심 개념</h3>
              <div className="core-concepts">
                <ReactMarkdown>{selectedLesson.core_concepts}</ReactMarkdown>
              </div>
            </section>

            {/* 코드 예시 */}
            {selectedLesson.code_examples.length > 0 && (
              <section className="lesson-section">
                <h3>코드 예시</h3>
                {selectedLesson.code_examples.map((example, index) => (
                  <div key={index} className="code-example">
                    <h4>{example.description}</h4>
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }: any) {
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
                      {example.code}
                    </ReactMarkdown>
                  </div>
                ))}
              </section>
            )}

            {/* 퀴즈 */}
            {selectedLesson.quizzes.length > 0 && (
              <section className="lesson-section">
                <h3>퀴즈</h3>
                {selectedLesson.quizzes.map((quiz, index) => {
                  const quizId = `lesson-${selectedLesson.title}-quiz-${index}`;
                  const isAnswerVisible = showAnswers.has(quizId);
                  
                  return (
                    <div key={index} className="quiz-item">
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
                        <div className="quiz-answer">
                          <strong>정답:</strong> {quiz.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        )}
      </div>

      {/* 모달: 초급 레벨 상세 자료 크게 보기 */}
      {showModal && selectedLesson && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>✖</button>
            <div className="lesson-detail modal-lesson-detail">
              <h2>{selectedLesson.title}</h2>
              <div className="lesson-level">레벨: {selectedLesson.level}</div>
              <section className="lesson-section">
                <h3>핵심 개념</h3>
                <div className="core-concepts">
                  <ReactMarkdown>{selectedLesson.core_concepts}</ReactMarkdown>
                </div>
              </section>
              {selectedLesson.code_examples.length > 0 && (
                <section className="lesson-section">
                  <h3>코드 예시</h3>
                  {selectedLesson.code_examples.map((example, index) => (
                    <div key={index} className="code-example">
                      <h4>{example.description}</h4>
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }: any) {
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
                        {example.code}
                      </ReactMarkdown>
                    </div>
                  ))}
                </section>
              )}
              {selectedLesson.quizzes.length > 0 && (
                <section className="lesson-section">
                  <h3>퀴즈</h3>
                  {selectedLesson.quizzes.map((quiz, index) => {
                    const quizId = `modal-lesson-${selectedLesson.title}-quiz-${index}`;
                    const isAnswerVisible = showAnswers.has(quizId);
                    return (
                      <div key={index} className="quiz-item">
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
                          <div className="quiz-answer">
                            <strong>정답:</strong> {quiz.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
