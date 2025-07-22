import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './LMSPage.css';

interface Lecture {
  id: number;
  title: string;
  file: string;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  lectures: Lecture[];
}

const subjects: Subject[] = [
  {
    id: 'unitask',
    name: 'UniTask 완전 정복',
    description: 'Unity 비동기 프로그래밍의 모든 것을 배워보세요',
    lectures: [
      { id: 1, title: "UniTask 첫걸음", file: "lecture_01_unitask_첫걸음.md", description: "UniTask vs Coroutine, 기본 async/await, AsyncOperation" },
      { id: 2, title: "시간과 프레임 제어", file: "lecture_02_시간과_프레임_제어.md", description: "UniTask.Delay, DelayFrame, Yield, NextFrame, ignoreTimeScale" },
      { id: 3, title: "Unity AsyncOperation 완전 정복", file: "lecture_03_unity_asyncoperation_완전_정복.md", description: "SceneManager, Resources, UnityWebRequest, Addressables 비동기 처리" },
      { id: 4, title: "취소 시스템 마스터하기", file: "lecture_04_취소_시스템_마스터하기.md", description: "CancellationToken 심화, GetCancellationTokenOnDestroy, CancelAfterSlim" },
      { id: 5, title: "예외 처리와 안전한 코딩", file: "lecture_05_예외_처리와_안전한_코딩.md", description: "try-catch 패턴, OperationCanceledException, Result<T> 패턴" },
      { id: 6, title: "진행 상황과 피드백", file: "lecture_06_진행_상황과_피드백.md", description: "IProgress<T>, Progress.Create, 로딩바 실무 패턴" },
      { id: 7, title: "병렬 처리의 기술", file: "lecture_07_병렬_처리의_기술.md", description: "WhenAll, WhenAny, 복합 작업 조합, 조건부 병렬 처리" },
      { id: 8, title: "커스텀 비동기 작업", file: "lecture_08_커스텀_비동기_작업.md", description: "UniTaskCompletionSource 활용, 콜백을 async/await로 변환" },
      { id: 9, title: "async void vs UniTaskVoid", file: "lecture_09_async_void_vs_unitaskvoid.md", description: "fire-and-forget 패턴, UniTask.Action, MonoBehaviour 생명주기 연동" },
      { id: 10, title: "AsyncEnumerable과 스트림", file: "lecture_10_asyncenumerable과_스트림.md", description: "IUniTaskAsyncEnumerable, Async LINQ, 실시간 데이터 스트림 처리" },
      { id: 11, title: "Unity 이벤트와 UI 연동", file: "lecture_11_unity_이벤트와_ui_연동.md", description: "Awaitable Events, AsyncTriggers, Button 클릭 비동기 처리" },
      { id: 12, title: "디버깅과 성능 최적화", file: "lecture_12_디버깅과_성능_최적화.md", description: "UniTaskTracker 활용법, 메모리 누수 방지, 성능 프로파일링" }
    ]
  }
];

function LMSPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [requestText, setRequestText] = useState<string>('');
  const [showFloatingPanel, setShowFloatingPanel] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);

  const loadLecture = async (filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/lectures/${filename}`);
      if (response.ok) {
        const text = await response.text();
        setContent(text);
      } else {
        setContent('강의를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('강의 로딩 실패:', error);
      setContent('강의를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLectureSelect = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    loadLecture(lecture.file);
  };

  useEffect(() => {
    // 페이지 로드 시 첫 번째 강의 자동 선택
    if (selectedSubject.lectures.length > 0) {
      handleLectureSelect(selectedSubject.lectures[0]);
    }
  }, [selectedSubject]);

  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedLecture(null);
    setContent('');
  };

  const handlePreviousLecture = () => {
    if (!selectedLecture) return;
    const currentIndex = selectedSubject.lectures.findIndex(l => l.id === selectedLecture.id);
    if (currentIndex > 0) {
      handleLectureSelect(selectedSubject.lectures[currentIndex - 1]);
    }
  };

  const handleNextLecture = () => {
    if (!selectedLecture) return;
    const currentIndex = selectedSubject.lectures.findIndex(l => l.id === selectedLecture.id);
    if (currentIndex < selectedSubject.lectures.length - 1) {
      handleLectureSelect(selectedSubject.lectures[currentIndex + 1]);
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('요청이 제출되었습니다. 관리자가 검토 후 학습 자료를 생성해드릴 예정입니다.');
    setRequestText('');
    setShowRequestModal(false);
    setShowFloatingPanel(false);
  };

  const handleFloatingIconClick = () => {
    setShowFloatingPanel(!showFloatingPanel);
  };

  const handleRequestOptionClick = () => {
    setShowRequestModal(true);
    setShowFloatingPanel(false);
  };

  const handleModalClose = () => {
    setShowRequestModal(false);
    setRequestText('');
  };

  const currentLectureIndex = selectedLecture ? selectedSubject.lectures.findIndex(l => l.id === selectedLecture.id) : -1;
  const isFirstLecture = currentLectureIndex === 0;
  const isLastLecture = currentLectureIndex === selectedSubject.lectures.length - 1;

  return (
    <div className="lms-page">
      <div className="lms-header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-left">
              <h1>📚 LMS</h1>
              <p className="header-subtitle">🤖 AI가 생성한 맞춤형 강의로 체계적 학습</p>
            </div>
            
            <div className="subject-selector">
              <select 
                value={selectedSubject.id} 
                onChange={(e) => {
                  const subject = subjects.find(s => s.id === e.target.value);
                  if (subject) handleSubjectChange(subject);
                }}
                className="subject-select"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-container">
        {/* 강의 목록 */}
        <div className="lecture-sidebar">
          <h2>강의 목록</h2>
          <div className="lecture-list">
            {selectedSubject.lectures.map(lecture => (
              <div 
                key={lecture.id}
                className={`lecture-item ${selectedLecture?.id === lecture.id ? 'active' : ''}`}
                onClick={() => handleLectureSelect(lecture)}
              >
                <div className="lecture-number">{lecture.id}강</div>
                <div className="lecture-info">
                  <h3>{lecture.title}</h3>
                  <p>{lecture.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 강의 내용 */}
        <div className="lecture-content">
          {loading ? (
            <div className="loading">강의를 불러오는 중...</div>
          ) : content ? (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
              
              {/* 강의 네비게이션 버튼 */}
              {selectedLecture && (
                <div className="lecture-navigation">
                  {!isFirstLecture && (
                    <button 
                      className="nav-button prev-button"
                      onClick={handlePreviousLecture}
                    >
                      ← 이전 강의
                    </button>
                  )}
                  {!isLastLecture && (
                    <button 
                      className="nav-button next-button"
                      onClick={handleNextLecture}
                    >
                      다음 강의 →
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-content">강의를 선택해주세요</div>
          )}
        </div>
      </div>
      
      {/* 우측 하단 플로팅 아이콘 */}
      <div className="floating-container">
        <button className="floating-icon" onClick={handleFloatingIconClick}>
          +
        </button>
        
        {showFloatingPanel && (
          <div className="floating-panel">
            <div className="panel-option" onClick={handleRequestOptionClick}>
              <span className="option-icon">📚</span>
              <span className="option-text">기술스택 신청</span>
            </div>
            <div className="panel-option" onClick={() => alert('추후 기능 예정')}>
              <span className="option-icon">⚙️</span>
              <span className="option-text">기타 기능</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 기술스택 신청 모달 */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>새로운 기술스택 학습 신청</h2>
              <button className="modal-close" onClick={handleModalClose}>×</button>
            </div>
            <div className="modal-body">
              <p>배우고 싶은 기술이나 주제가 있으시면 신청해주세요.</p>
              <form onSubmit={handleRequestSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="tech-request">원하는 기술스택 또는 주제:</label>
                  <textarea
                    id="tech-request"
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="예: React Advanced Patterns, Spring Boot 심화, Python 머신러닝, Docker & Kubernetes 등"
                    rows={4}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={handleModalClose}>
                    취소
                  </button>
                  <button type="submit" className="submit-button">
                    신청하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LMSPage;