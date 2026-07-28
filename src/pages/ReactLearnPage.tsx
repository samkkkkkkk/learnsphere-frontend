import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import LessonChatPanel from '../components/chat/LessonChatPanel';
import { fetchLessonIndex, fetchLessonDetail } from '../api/lessonApi';
import type { LessonDetail, LessonIndex } from '../api/lessonApi';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Breadcrumb from '../components/ui/Breadcrumb';
import Quiz from '../components/Quiz';
import { getQuizProgress, lessonIdOf, QUIZ_PROGRESS_EVENT } from '../components/quizProgress';
import * as learningApi from '../api/learningApi';
import { useAuth } from '../contexts/AuthContext';
import './ReactLearnPage.css';

// 학습 수준을 위한 타입 정의
// MainPage의 과목 목록을 반영
const topics = [
  { key: 'react', label: 'React', desc: '프론트엔드 라이브러리', available: true, hasLevels: true },
  { key: 'UniTask', label: 'UniTask', desc: '비동기 프로그래밍', available: true, hasLevels: false },
  { key: 'python', label: 'Python', desc: '프로그래밍 언어', available: false, hasLevels: false },
];
type Level = '초급' | '중급' | '고급';

/**
 * React 학습 자료 생성기 메인 UI 컴포넌트
 */
// 마지막 학습 위치 저장 키
const LAST_LESSON_KEY = 'learnsphere.lastLesson';
// 로컬 퀴즈 기록을 서버로 1회 업로드했는지 표시하는 마커
const QUIZ_UPLOAD_MARKER = 'learnsphere.quiz.uploaded';

/** localStorage의 퀴즈 기록을 서버 이관용 목록으로 모은다. */
function collectLocalQuizRecords(): learningApi.LessonProgressItem[] {
  const items: learningApi.LessonProgressItem[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('learnsphere.quiz.lesson-')) continue;
    const lessonId = lessonIdOf(key.replace('learnsphere.quiz.', ''));
    if (lessonId === null) continue;
    const progress = getQuizProgress(`lesson-${lessonId}`);
    if (!progress) continue;
    items.push({
      lesson_id: lessonId,
      done: progress.done,
      correct: progress.correct,
      total: progress.total,
      completed: progress.completed,
    });
  }
  return items;
}

function loadLastLesson(): { level: Level; lessonId: number } | null {
  try {
    return JSON.parse(localStorage.getItem(LAST_LESSON_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export default function ReactLearn() {
  const navigate = useNavigate();
  const location = useLocation();
  // 우선순위: 로드맵에서 넘어온 레벨 > 마지막 학습 위치 > 초급
  const lastLesson = loadLastLesson();
  const initialLevel =
    (location.state as { level?: Level } | null)?.level ?? lastLesson?.level ?? '초급';
  // 컴포넌트의 상태 관리
  const [selectedTopic, setSelectedTopic] = useState<string>('react');
  const [level, setLevel] = useState<Level>(initialLevel);
  const [lessonIndex, setLessonIndex] = useState<LessonIndex | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLessonChatOpen, setIsLessonChatOpen] = useState(false);
  // 퀴즈 진도가 바뀌면 레슨 목록 완료 뱃지를 다시 그린다
  const [quizVersion, setQuizVersion] = useState(0);

  useEffect(() => {
    const onQuizUpdate = () => setQuizVersion(v => v + 1);
    window.addEventListener(QUIZ_PROGRESS_EVENT, onQuizUpdate);
    return () => window.removeEventListener(QUIZ_PROGRESS_EVENT, onQuizUpdate);
  }, []);

  const { user } = useAuth();
  // 서버에 저장된 레슨별 완료 여부 — 다른 기기의 기록도 뱃지에 반영된다
  const [serverCompleted, setServerCompleted] = useState<Record<number, boolean> | null>(null);

  useEffect(() => {
    if (!user) {
      setServerCompleted(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      // 이 브라우저의 예전 퀴즈 기록을 1회만 서버로 올린다
      try {
        if (!localStorage.getItem(QUIZ_UPLOAD_MARKER)) {
          const items = collectLocalQuizRecords();
          if (items.length > 0) await learningApi.importLessonProgress(items);
          localStorage.setItem(QUIZ_UPLOAD_MARKER, new Date().toISOString());
        }
      } catch {
        // 업로드 실패 시 마커를 남기지 않는다 — 다음 방문에 재시도
      }
      try {
        const list = await learningApi.fetchLessonProgress();
        if (!cancelled) {
          setServerCompleted(Object.fromEntries(
            list.map(p => [p.lesson_id, p.completed])));
        }
      } catch {
        // 서버 조회 실패 시 로컬 기록만으로 뱃지를 그린다
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [user]);

  // 뱃지: 이 브라우저 기록(즉시 반영) 또는 서버 기록(다른 기기 포함)
  const isLessonCompleted = (lessonId: number) =>
    (getQuizProgress(`lesson-${lessonId}`)?.completed ?? false) ||
    (serverCompleted?.[lessonId] ?? false);

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
  const loadLessonDetail = async (lessonId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const lesson = await fetchLessonDetail(lessonId);
      setSelectedLesson(lesson);
      // 마지막 학습 위치 저장 — 다음 방문 시 이어서 학습
      localStorage.setItem(
        LAST_LESSON_KEY,
        JSON.stringify({ level: lesson.level, lessonId: lesson.id }),
      );
    } catch (err) {
      setError('레슨 내용을 불러오는데 실패했습니다.');
      console.error('레슨 상세 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
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
   * 과목 변경 핸들러
   */
  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTopic = e.target.value;
    // UniTask는 전용 LMS 화면으로 이동 (URL 공유·뒤로가기 가능)
    if (newTopic === 'UniTask') {
      navigate('/lms');
      return;
    }
    setSelectedTopic(newTopic);
    setSelectedLesson(null);
    setLessonIndex(null);
    // React만 레벨별 자료 제공, 그 외는 향후 확장
    if (newTopic === 'react') {
      setLevel('초급');
      loadLessonIndex();
    } else {
      setLevel('초급');
    }
  };

  /**
   * 레벨 변경 시 해당 레벨의 레슨 목록 표시 및 첫 번째 레슨 자동 로드
   */
  const handleLevelChange = (newLevel: Level) => {
    setLevel(newLevel);
    setSelectedLesson(null);
    
    // 레슨 인덱스가 로드되어 있고, 해당 레벨에 레슨이 있으면 첫 번째 레슨을 자동으로 로드
    if (lessonIndex && lessonIndex[newLevel] && lessonIndex[newLevel].length > 0) {
      const firstLesson = lessonIndex[newLevel][0];
      loadLessonDetail(firstLesson.id);
    }
  };

  /**
   * 컴포넌트 마운트 시 레슨 인덱스 로드
   */
  useEffect(() => {
    if (selectedTopic === 'react') {
      loadLessonIndex();
    }
  }, [selectedTopic]);
  
  /**
   * 레슨 인덱스가 로드되면 첫 번째 레슨을 자동으로 로드
   */
  useEffect(() => {
    if (lessonIndex && lessonIndex[level] && lessonIndex[level].length > 0 && !selectedLesson) {
      // 마지막으로 본 레슨이 현재 레벨에 있으면 이어서 학습, 없으면 첫 레슨
      const saved = loadLastLesson();
      const resume =
        saved && saved.level === level
          ? lessonIndex[level].find(lesson => lesson.id === saved.lessonId)
          : undefined;
      loadLessonDetail((resume ?? lessonIndex[level][0]).id);
    }
  }, [lessonIndex, level, selectedLesson]);

  // 이전/다음 레슨 (#8) — 현재 레벨 목록 기준
  const levelLessons = lessonIndex?.[level] ?? [];
  const lessonPos = selectedLesson
    ? levelLessons.findIndex(lesson => lesson.id === selectedLesson.id)
    : -1;
  const prevLesson = lessonPos > 0 ? levelLessons[lessonPos - 1] : null;
  const nextLesson =
    lessonPos >= 0 && lessonPos < levelLessons.length - 1 ? levelLessons[lessonPos + 1] : null;

  return (
    (
      <div className="react-learn-container">
        <header className="react-learn-header">
          <h1>React 학습 자료 📚</h1>
          <p>AI가 생성한 React 학습 자료를 확인하고 학습하세요.</p>
        </header>
        <div className="react-learn-controls">
          <div className="topic-level-selector" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="topic-selector">
              <label htmlFor="topic-select">과목</label>
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={handleTopicChange}
              >
                {topics.map((topic) => (
                  <option key={topic.key} value={topic.key} disabled={!topic.available}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>
            {/* 학습 수준은 해당 과목이 레벨 분류가 있을 때만 노출 */}
            {topics.find(t => t.key === selectedTopic)?.hasLevels && (
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
            )}
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
              <div className="lesson-grid" aria-busy="true">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} height={64} radius="var(--r-md)" />
                ))}
              </div>
            ) : lessonIndex && lessonIndex[level] ? (
              <div className="lesson-grid" data-quiz-version={quizVersion}>
                {lessonIndex[level].map((lesson) => (
                  <button
                    type="button"
                    key={lesson.id}
                    className={`lesson-card ${selectedLesson && selectedLesson.id === lesson.id ? 'active' : ''}`}
                    onClick={() => loadLessonDetail(lesson.id)}
                  >
                    <div className="lesson-number">{lesson.number}</div>
                    <div className="lesson-title">{lesson.title}</div>
                    {isLessonCompleted(lesson.id) && (
                      <span className="lesson-done" title="퀴즈 완료" role="img" aria-label="퀴즈 완료">✓</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-lessons">
                {level} 레벨의 레슨이 아직 준비되지 않았어요. 다른 레벨을 먼저 살펴보세요.
              </div>
            )}
          </div>

          {/* 선택된 레슨 상세 내용 */}
          {selectedLesson && (
            <div className="lesson-with-chat">
            <div className="lesson-detail">
              <Breadcrumb
                items={[
                  { label: '홈', to: '/' },
                  { label: 'React 학습', to: '/react-learn' },
                  { label: level },
                  { label: selectedLesson.title },
                ]}
              />
              <h2>{selectedLesson.title}</h2>
              <div className="lesson-level">레벨: {selectedLesson.level}</div>

              {!isLessonChatOpen && (
                <button
                  className="lesson-chat-open-button"
                  onClick={() => setIsLessonChatOpen(true)}
                >
                  💬 이 레슨에 대해 질문하기
                </button>
              )}

              {/* 핵심 개념 */}
              <section className="lesson-section">
                <h3>핵심 개념</h3>
                <div className="core-concepts">
                  <MarkdownRenderer>{selectedLesson.core_concepts}</MarkdownRenderer>
                </div>
              </section>

              {/* 코드 예시 */}
              {selectedLesson.code_examples.length > 0 && (
                <section className="lesson-section">
                  <h3>코드 예시</h3>
                  {selectedLesson.code_examples.map((example, index) => (
                    <div key={index} className="code-example">
                      <h4>{example.description}</h4>
                      <MarkdownRenderer>{example.code}</MarkdownRenderer>
                    </div>
                  ))}
                </section>
              )}

              {/* 퀴즈 — 자가 채점, 결과는 레슨 id 기준으로 저장 */}
              {selectedLesson.quizzes.length > 0 && (
                <section className="lesson-section">
                  <h3>퀴즈</h3>
                  <Quiz
                    quizzes={selectedLesson.quizzes}
                    storageKey={`lesson-${selectedLesson.id}`}
                  />
                </section>
              )}

              {/* 이전/다음 레슨 이동 (#8) */}
              {(prevLesson || nextLesson) && (
                <nav className="lesson-navigation" aria-label="레슨 이동">
                  {prevLesson ? (
                    <button
                      type="button"
                      className="lesson-nav-btn"
                      onClick={() => loadLessonDetail(prevLesson.id)}
                    >
                      ← 이전: {prevLesson.title}
                    </button>
                  ) : (
                    <span />
                  )}
                  {nextLesson && (
                    <button
                      type="button"
                      className="lesson-nav-btn"
                      onClick={() => loadLessonDetail(nextLesson.id)}
                    >
                      다음: {nextLesson.title} →
                    </button>
                  )}
                </nav>
              )}
            </div>

            {isLessonChatOpen && (
              // key로 레슨이 바뀌면 대화를 새로 시작한다
              <LessonChatPanel
                key={selectedLesson.id}
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                onClose={() => setIsLessonChatOpen(false)}
              />
            )}
            </div>
          )}
        </div>

        {/* 모달: 레슨 상세 자료 크게 보기 */}
        {selectedLesson && (
          <Modal
            open={showModal}
            onClose={handleCloseModal}
            title={selectedLesson.title}
            maxWidth={880}
          >
              <div className="lesson-detail modal-lesson-detail">
                <div className="lesson-level">레벨: {selectedLesson.level}</div>
                <section className="lesson-section">
                  <h3>핵심 개념</h3>
                  <div className="core-concepts">
                    <MarkdownRenderer>{selectedLesson.core_concepts}</MarkdownRenderer>
                  </div>
                </section>
                {selectedLesson.code_examples.length > 0 && (
                  <section className="lesson-section">
                    <h3>코드 예시</h3>
                    {selectedLesson.code_examples.map((example, index) => (
                      <div key={index} className="code-example">
                        <h4>{example.description}</h4>
                        <MarkdownRenderer>{example.code}</MarkdownRenderer>
                      </div>
                    ))}
                  </section>
                )}
                {selectedLesson.quizzes.length > 0 && (
                  <section className="lesson-section">
                    <h3>퀴즈</h3>
                    <Quiz
                      quizzes={selectedLesson.quizzes}
                      storageKey={`lesson-${selectedLesson.id}`}
                    />
                  </section>
                )}
              </div>
          </Modal>
        )}
      </div>
    )
  );
}
