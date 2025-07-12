import { useState, useEffect } from 'react';
import axios from 'axios';
import './ReactLearnPage4.css';

// API 응답 데이터의 타입을 정의합니다.
type Lesson = {
  title: string;
  filename: string;
  number: number;
  url: string;
};

/**
 * React 학습 자료 생성기 - HTML 파일 기반 버전 (ReactLearnPage4 스타일 유지)
 */
export default function ReactLearn() {
  // 컴포넌트의 상태 관리
  const [level, setLevel] = useState<'초급' | '중급' | '고급'>('초급');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [selectedLessonContent, setSelectedLessonContent] = useState<string>('');

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
    setSelectedLessonContent('');
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
      // HTML에서 body 내용만 추출
      const htmlContent = response.data;
      const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        const bodyContent = bodyMatch[1];
        // lesson-container div 내용 추출
        const containerMatch = bodyContent.match(/<div class="lesson-container">([\s\S]*?)<\/div>/i);
        if (containerMatch) {
          let containerContent = containerMatch[1];
          
          // 불필요한 공백과 줄바꿈 정리
          containerContent = containerContent
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
          
          setSelectedLessonContent(containerContent);
        } else {
          setSelectedLessonContent(bodyContent);
        }
      } else {
        setSelectedLessonContent(htmlContent);
      }
    } catch (err) {
      console.error('학습 자료 내용 로드 실패:', err);
      setSelectedLessonContent('<p>학습 자료를 불러오는 중 오류가 발생했습니다.</p>');
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
   * 토픽 완료 표시 함수
   */
  const markTopicCompleted = (topicTitle: string) => {
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      newSet.add(topicTitle);
      return newSet;
    });
  };

  const selectedLesson = lessons.find(lesson => lesson.title === selectedTopic);

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
                  <h2>{selectedTopic}</h2>
                  <div className="content-actions">
                    <button 
                      className="action-btn"
                      onClick={() => {
                        const lesson = lessons.find(l => l.title === selectedTopic);
                        if (lesson) {
                          window.open(`http://localhost:8000${lesson.url}`, '_blank');
                        }
                      }}
                    >
                      📄 새 창에서 보기
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => markTopicCompleted(selectedTopic || '')}
                    >
                      ✅ 이 토픽 완료하기
                    </button>
                  </div>
                </div>
                <div 
                  className="content-body"
                  dangerouslySetInnerHTML={{ __html: selectedLessonContent }}
                />
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