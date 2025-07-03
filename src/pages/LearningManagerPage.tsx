import React, { useState, useEffect, useRef } from 'react';
import './LearningManagerPage.css';

const CATEGORY_MAP = {
  programming: '프로그래밍',
  design: '디자인',
  language: '언어',
  business: '비즈니스',
  other: '기타',
};

const NAV_TABS = [
  { id: 'goals', label: '목표 설정', icon: 'fas fa-target' },
  { id: 'schedule', label: '일정 관리', icon: 'fas fa-calendar-alt' },
  { id: 'feedback', label: 'AI 피드백', icon: 'fas fa-robot' },
  { id: 'progress', label: '진도 현황', icon: 'fas fa-chart-bar' },
];

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

type GoalFormType = {
  title: string;
  category: string;
  deadline: string;
  description: string;
  dailyStudyTime: number;
};
type ScheduleFormType = {
  goalId: string;
  date: string;
  time: string;
  content: string;
  duration: number;
};

export default function LearningManagerPage() {
  // State
  const [activeTab, setActiveTab] = useState('goals');
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('goals') || '[]');
    } catch {
      return [];
    }
  });
  const [schedules, setSchedules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('schedules') || '[]');
    } catch {
      return [];
    }
  });
  const [goalForm, setGoalForm] = useState<GoalFormType>({
    title: '',
    category: '',
    deadline: getTodayStr(),
    description: '',
    dailyStudyTime: 60,
  });
  const [editingGoalId, setEditingGoalId] = useState<null | number>(null);
  const [goalMessage, setGoalMessage] = useState<{text: string, type: string} | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormType>({
    goalId: '',
    date: getTodayStr(),
    time: '',
    content: '',
    duration: 60,
  });
  const [feedbackType, setFeedbackType] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null);
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  // Refs
  const scheduleFormRef = useRef<HTMLFormElement>(null);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Goal Form Handlers
  const handleGoalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setGoalForm({
      ...goalForm,
      [id]: type === 'number' ? Number(value) : value,
    });
  };
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.category || !goalForm.deadline) return;
    if (editingGoalId) {
      setGoals(goals => goals.map(g => g.id === editingGoalId ? { ...g, ...goalForm, dailyStudyTime: Number(goalForm.dailyStudyTime) } : g));
      setGoalMessage({ text: '목표가 수정되었습니다!', type: 'success' });
      setEditingGoalId(null);
    } else {
      setGoals(goals => [
        ...goals,
        {
          id: Date.now(),
          ...goalForm,
          dailyStudyTime: Number(goalForm.dailyStudyTime),
          progress: 0,
          createdAt: new Date().toISOString(),
        },
      ]);
      setGoalMessage({ text: '목표가 성공적으로 추가되었습니다!', type: 'success' });
    }
    setGoalForm({ title: '', category: '', deadline: getTodayStr(), description: '', dailyStudyTime: 60 });
  };
  const handleGoalEdit = (goal: any) => {
    setGoalForm({
      title: goal.title,
      category: goal.category,
      deadline: goal.deadline,
      description: goal.description,
      dailyStudyTime: goal.dailyStudyTime,
    });
    setEditingGoalId(goal.id);
  };
  const handleGoalDelete = (goalId: number) => {
    if (window.confirm('정말로 이 목표를 삭제하시겠습니까?')) {
      setGoals(goals => goals.filter(g => g.id !== goalId));
    }
  };

  // Schedule
  const handleScheduleModalOpen = () => setScheduleModalOpen(true);
  const handleScheduleModalClose = () => {
    setScheduleModalOpen(false);
    setScheduleForm({ goalId: '', date: getTodayStr(), time: '', content: '', duration: 60 });
    scheduleFormRef.current?.reset();
  };
  const handleScheduleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setScheduleForm({
      ...scheduleForm,
      [id]: type === 'number' ? Number(value) : value,
    });
  };
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchedules(schedules => [
      ...schedules,
      {
        id: Date.now(),
        goalId: Number(scheduleForm.goalId),
        date: scheduleForm.date,
        time: scheduleForm.time,
        content: scheduleForm.content,
        duration: Number(scheduleForm.duration),
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    handleScheduleModalClose();
  };
  const handleScheduleComplete = (scheduleId: number) => {
    setSchedules(schedules => schedules.map(s => s.id === scheduleId ? { ...s, completed: !s.completed } : s));
    // 진도 업데이트
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule && !schedule.completed) {
      setGoals(goals => goals.map(g => g.id === schedule.goalId ? { ...g, progress: Math.min(100, (g.progress || 0) + Math.min(5, (schedule.duration / 60) * 2)) } : g));
    }
  };

  // Calendar helpers
  function getStartOfWeek(date: Date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  }
  function getWeekNumber(date: Date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }
  function isToday(date: Date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  function getSchedulesForDate(date: Date) {
    const dateString = date.toISOString().split('T')[0];
    return schedules.filter(s => s.date === dateString);
  }

  // Feedback
  const handleFeedback = (type: string) => {
    setFeedbackType(type);
    setFeedbackLoading(true);
    setFeedbackResult(null);
    setTimeout(() => {
      setFeedbackLoading(false);
      setFeedbackResult(getAIFeedback(type));
    }, 1200);
  };
  function getAIFeedback(type: string) {
    const completedSchedules = schedules.filter(s => s.completed).length;
    const totalSchedules = schedules.length;
    const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0;
    if (type === 'content') {
      return `<h4><i class='fas fa-book'></i> 학습 콘텐츠 추천</h4><p>현재 진도율 ${avgProgress.toFixed(1)}%를 바탕으로 다음 학습 콘텐츠를 추천드립니다:</p><ul class='feedback-list'><li><i class='fas fa-check'></i> 기초 개념 복습 자료 - 이해도 향상을 위해</li><li><i class='fas fa-check'></i> 실습 프로젝트 - 실무 경험 쌓기</li><li><i class='fas fa-check'></i> 온라인 강의 - 체계적인 학습</li><li><i class='fas fa-check'></i> 커뮤니티 참여 - 동기부여 및 질문 해결</li></ul><p>특히 현재 진도에서는 <strong>실습 위주의 학습</strong>을 권장합니다.</p>`;
    }
    if (type === 'schedule') {
      return `<h4><i class='fas fa-clock'></i> 학습 분량 조절 제안</h4><p>현재 일정 완료율: ${totalSchedules > 0 ? ((completedSchedules / totalSchedules) * 100).toFixed(1) : 0}%</p>${completedSchedules / totalSchedules < 0.7 ? `<p><strong>⚠️ 학습 분량 조절이 필요합니다:</strong></p><ul class='feedback-list'><li><i class='fas fa-check'></i> 일일 학습 시간을 20% 줄여보세요</li><li><i class='fas fa-check'></i> 주 3-4회로 빈도를 조정하세요</li><li><i class='fas fa-check'></i> 짧고 집중적인 세션을 권장합니다</li></ul>` : `<p><strong>✅ 현재 학습 페이스가 적절합니다!</strong></p><ul class='feedback-list'><li><i class='fas fa-check'></i> 현재 분량을 유지하세요</li><li><i class='fas fa-check'></i> 점진적으로 난이도를 높여보세요</li><li><i class='fas fa-check'></i> 복습 시간을 추가로 확보하세요</li></ul>`}`;
    }
    if (type === 'progress') {
      return `<h4><i class='fas fa-chart-line'></i> 진도 분석 리포트</h4><p>전체 목표 평균 진도율: <strong>${avgProgress.toFixed(1)}%</strong></p><p>완료된 학습 세션: <strong>${completedSchedules}/${totalSchedules}</strong></p>${avgProgress < 30 ? `<p><strong>🚀 초기 단계 - 기초 다지기에 집중하세요</strong></p><ul class='feedback-list'><li><i class='fas fa-check'></i> 꾸준함이 가장 중요합니다</li><li><i class='fas fa-check'></i> 작은 성취도 축하하세요</li><li><i class='fas fa-check'></i> 기초 개념을 확실히 잡으세요</li></ul>` : avgProgress < 70 ? `<p><strong>📈 중간 단계 - 실력 향상이 눈에 보입니다</strong></p><ul class='feedback-list'><li><i class='fas fa-check'></i> 실습 비중을 늘려보세요</li><li><i class='fas fa-check'></i> 프로젝트를 시작해보세요</li><li><i class='fas fa-check'></i> 다른 학습자와 교류하세요</li></ul>` : `<p><strong>🎯 고급 단계 - 목표 달성이 가까워졌습니다</strong></p><ul class='feedback-list'><li><i class='fas fa-check'></i> 심화 학습에 도전하세요</li><li><i class='fas fa-check'></i> 포트폴리오를 준비하세요</li><li><i class='fas fa-check'></i> 새로운 목표를 설정하세요</li></ul>`}`;
    }
    if (type === 'motivation') {
      return `<h4><i class='fas fa-fire'></i> 동기부여 메시지</h4><p><strong>🌟 당신은 이미 훌륭한 학습자입니다!</strong></p><p>지금까지의 노력이 결실을 맺고 있습니다. ${completedSchedules}개의 학습 세션을 완료하신 것은 정말 대단한 성과입니다.</p><div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;"><h4 style="margin-bottom: 1rem;">💪 오늘의 동기부여</h4><p style="font-style: italic; margin-bottom: 0;">"성공은 매일매일의 작은 노력이 쌓여서 만들어지는 것입니다. 오늘도 한 걸음 더 나아가세요!"</p></div><ul class='feedback-list'><li><i class='fas fa-check'></i> 매일 조금씩이라도 꾸준히 하세요</li><li><i class='fas fa-check'></i> 완벽하지 않아도 괜찮습니다</li><li><i class='fas fa-check'></i> 진전이 있다면 자신을 칭찬하세요</li><li><i class='fas fa-check'></i> 목표를 달성한 미래의 자신을 상상해보세요</li></ul>`;
    }
    return '';
  }

  // Progress Dashboard helpers
  const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0;
  const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length;
  const thisWeekSchedules = schedules.filter(s => {
    const start = getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const scheduleDate = new Date(s.date);
    return scheduleDate >= start && scheduleDate <= end;
  });
  const completedHours = thisWeekSchedules.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0) / 60;
  // Streak 계산
  function calculateStreak() {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const daySchedules = schedules.filter(s => s.date === dateString && s.completed);
      if (daySchedules.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }
  const streak = calculateStreak();

  // 주간 차트 데이터
  function getWeeklyStudyData() {
    const start = getStartOfWeek(new Date());
    const weekData = new Array(7).fill(0);
    schedules.forEach(s => {
      if (s.completed) {
        const dayOfWeek = new Date(s.date).getDay();
        weekData[dayOfWeek] += s.duration / 60;
      }
    });
    return weekData;
  }
  const weekData = getWeeklyStudyData();

  // UI
  return (
    <div className="lm-layout">
      <aside className="lm-sidebar">
        <button className={activeTab === 'goals' ? 'active' : ''} onClick={() => setActiveTab('goals')}>
          <i className="fas fa-target"></i> 목표설정
        </button>
        <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
          <i className="fas fa-calendar-alt"></i> 일정관리
        </button>
        <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
          <i className="fas fa-robot"></i> AI피드백
        </button>
        <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>
          <i className="fas fa-chart-bar"></i> 진도현황
        </button>
      </aside>
      <main className="lm-main">
        <div className="container">
          {/* 목표 설정 */}
          {activeTab === 'goals' && (
            <section id="goals" className="section active">
              <div className="section-header">
                <h2><i className="fas fa-target"></i> 학습 목표 설정</h2>
                <p>명확한 목표를 설정하여 효율적인 학습을 시작하세요</p>
              </div>
              <div className="goal-form-container">
                <form id="goalForm" className="goal-form" onSubmit={handleGoalSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">학습 목표</label>
                    <input type="text" id="title" value={goalForm.title ?? ''} onChange={handleGoalFormChange} placeholder="예: React 마스터하기" required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">카테고리</label>
                      <select id="category" value={goalForm.category ?? ''} onChange={handleGoalFormChange} required>
                        <option value="">선택하세요</option>
                        <option value="programming">프로그래밍</option>
                        <option value="design">디자인</option>
                        <option value="language">언어</option>
                        <option value="business">비즈니스</option>
                        <option value="other">기타</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="deadline">목표 완료일</label>
                      <input type="date" id="deadline" value={goalForm.deadline ?? getTodayStr()} min={getTodayStr()} onChange={handleGoalFormChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">상세 설명</label>
                    <textarea id="description" value={goalForm.description ?? ''} onChange={handleGoalFormChange} placeholder="목표에 대한 구체적인 설명을 입력하세요" rows={3} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dailyStudyTime">일일 학습 시간 (분)</label>
                    <input type="number" id="dailyStudyTime" min={15} max={480} value={goalForm.dailyStudyTime ?? 60} onChange={handleGoalFormChange} required />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-plus"></i> {editingGoalId ? '목표 수정' : '목표 추가'}
                  </button>
                </form>
                {goalMessage && (
                  <div className={`message ${goalMessage.type} show`} style={{marginTop: 12}}>{goalMessage.text}</div>
                )}
              </div>
              <div className="goals-list" id="goalsList">
                {goals.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-target"></i>
                    <p>아직 설정된 목표가 없습니다. 첫 번째 목표를 추가해보세요!</p>
                  </div>
                ) : (
                  goals.map((goal: any) => (
                    <div className="goal-item" key={goal.id}>
                      <div className="goal-header">
                        <h3 className="goal-title">{goal.title}</h3>
                        <span className="goal-category">{CATEGORY_MAP[goal.category] || goal.category}</span>
                      </div>
                      <p className="goal-description">{goal.description}</p>
                      <div className="goal-progress">
                        <div className="goal-progress-fill" style={{width: `${goal.progress || 0}%`}}></div>
                      </div>
                      <div className="goal-meta">
                        <span><i className="fas fa-calendar"></i> {goal.deadline}</span>
                        <span><i className="fas fa-clock"></i> {goal.dailyStudyTime}분/일</span>
                        <span className="progress-text">{goal.progress || 0}% 완료</span>
                      </div>
                      <div className="goal-actions">
                        <button className="edit-btn" onClick={() => handleGoalEdit(goal)}><i className="fas fa-edit"></i></button>
                        <button className="delete-btn" onClick={() => handleGoalDelete(goal.id)}><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
          {/* 일정 관리 */}
          {activeTab === 'schedule' && (
            <section id="schedule" className="section active">
              <div className="section-header">
                <h2><i className="fas fa-calendar-alt"></i> 학습 일정 관리</h2>
                <p>체계적인 일정으로 꾸준한 학습 습관을 만들어보세요</p>
              </div>
              <div className="schedule-controls">
                <button id="addScheduleBtn" className="btn btn-primary" onClick={handleScheduleModalOpen}>
                  <i className="fas fa-plus"></i> 일정 추가
                </button>
                <div className="view-controls">
                  <button className="btn btn-outline active">주간</button>
                  <button className="btn btn-outline">월간</button>
                </div>
              </div>
              <div className="calendar-container">
                <div className="calendar-header">
                  <button id="prevWeek" className="btn btn-icon" onClick={() => setCalendarWeek(new Date(calendarWeek.setDate(calendarWeek.getDate() - 7)))}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <h3 id="currentWeek">{calendarWeek.getFullYear()}년 {calendarWeek.getMonth() + 1}월 {getWeekNumber(calendarWeek)}주차</h3>
                  <button id="nextWeek" className="btn btn-icon" onClick={() => setCalendarWeek(new Date(calendarWeek.setDate(calendarWeek.getDate() + 7)))}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                <div className="calendar-grid" id="calendarGrid">
                  {Array.from({length: 7}).map((_, i) => {
                    const startOfWeek = getStartOfWeek(calendarWeek);
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                    const daySchedules = getSchedulesForDate(date);
                    return (
                      <div className={`calendar-day${isToday(date) ? ' today' : ''}`} key={i}>
                        <div className="day-header">{dayNames[i]} {date.getDate()}</div>
                        <div className="day-events">
                          {daySchedules.map((s: any) => (
                            <div className={`event-item${s.completed ? ' completed' : ''}`} key={s.id} onClick={() => handleScheduleComplete(s.id)}>
                              {s.time} {s.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 일정 추가 모달 */}
              {scheduleModalOpen && (
                <div className="modal active">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>학습 일정 추가</h3>
                      <button className="modal-close" onClick={handleScheduleModalClose}>&times;</button>
                    </div>
                    <form id="scheduleForm" ref={scheduleFormRef} onSubmit={handleScheduleSubmit}>
                      <div className="form-group">
                        <label htmlFor="goalId">연결된 목표</label>
                        <select id="goalId" value={scheduleForm.goalId ?? ''} onChange={handleScheduleFormChange} required>
                          <option value="">목표를 선택하세요</option>
                          {goals.map((goal: any) => (
                            <option value={goal.id} key={goal.id}>{goal.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="date">날짜</label>
                          <input type="date" id="date" value={scheduleForm.date ?? getTodayStr()} min={getTodayStr()} onChange={handleScheduleFormChange} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="time">시간</label>
                          <input type="time" id="time" value={scheduleForm.time ?? ''} onChange={handleScheduleFormChange} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="content">학습 내용</label>
                        <input type="text" id="content" value={scheduleForm.content ?? ''} onChange={handleScheduleFormChange} placeholder="예: React Hooks 학습" required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="duration">예상 소요 시간 (분)</label>
                        <input type="number" id="duration" min={15} max={300} value={scheduleForm.duration ?? 60} onChange={handleScheduleFormChange} required />
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={handleScheduleModalClose}>취소</button>
                        <button type="submit" className="btn btn-primary">일정 추가</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>
          )}
          {/* AI 피드백 */}
          {activeTab === 'feedback' && (
            <section id="feedback" className="section active">
              <div className="section-header">
                <h2><i className="fas fa-robot"></i> AI 학습 피드백</h2>
                <p>AI가 분석한 맞춤형 학습 조언을 받아보세요</p>
              </div>
              <div className="feedback-container">
                <div className="feedback-request">
                  <h3>피드백 요청</h3>
                  <div className="feedback-options">
                    <button className="feedback-btn" onClick={() => handleFeedback('content')}><i className="fas fa-book"></i> <span>학습 콘텐츠 추천</span></button>
                    <button className="feedback-btn" onClick={() => handleFeedback('schedule')}><i className="fas fa-clock"></i> <span>학습 분량 조절</span></button>
                    <button className="feedback-btn" onClick={() => handleFeedback('progress')}><i className="fas fa-chart-line"></i> <span>진도 분석</span></button>
                    <button className="feedback-btn" onClick={() => handleFeedback('motivation')}><i className="fas fa-fire"></i> <span>동기부여 메시지</span></button>
                  </div>
                </div>
                <div className="feedback-result" id="feedbackResult">
                  {feedbackLoading ? (
                    <div className="feedback-loading">
                      <div className="loading"></div>
                      <p>AI가 분석 중입니다...</p>
                    </div>
                  ) : feedbackResult ? (
                    <div className="feedback-content active" dangerouslySetInnerHTML={{__html: feedbackResult}} />
                  ) : (
                    <div className="feedback-placeholder">
                      <i className="fas fa-robot"></i>
                      <p>위 버튼을 클릭하여 AI 피드백을 받아보세요</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
          {/* 진도 현황 */}
          {activeTab === 'progress' && (
            <section id="progress" className="section active">
              <div className="section-header">
                <h2><i className="fas fa-chart-bar"></i> 학습 진도 현황</h2>
                <p>목표 달성률과 학습 패턴을 한눈에 확인하세요</p>
              </div>
              <div className="progress-dashboard">
                <div className="progress-cards">
                  <div className="progress-card">
                    <div className="progress-card-header">
                      <h3>전체 진도율</h3>
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div className="progress-value" id="overallProgress">{avgProgress.toFixed(1)}%</div>
                    <div className="progress-bar">
                      <div className="progress-fill" id="overallProgressBar" style={{width: `${avgProgress}%`}}></div>
                    </div>
                  </div>
                  <div className="progress-card">
                    <div className="progress-card-header">
                      <h3>이번 주 학습시간</h3>
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="progress-value" id="weeklyHours">{completedHours.toFixed(1)}시간</div>
                    <div className="progress-subtitle">목표: 7시간</div>
                  </div>
                  <div className="progress-card">
                    <div className="progress-card-header">
                      <h3>연속 학습일</h3>
                      <i className="fas fa-fire"></i>
                    </div>
                    <div className="progress-value" id="streakDays">{streak}일</div>
                    <div className="progress-subtitle">최고 기록: {streak}일</div>
                  </div>
                  <div className="progress-card">
                    <div className="progress-card-header">
                      <h3>완료된 목표</h3>
                      <i className="fas fa-trophy"></i>
                    </div>
                    <div className="progress-value" id="completedGoals">{completedGoals}개</div>
                    <div className="progress-subtitle">전체 목표 중</div>
                  </div>
                </div>
                <div className="progress-charts">
                  <div className="chart-container">
                    <h3>주간 학습 패턴</h3>
                    <div className="weekly-chart" id="weeklyChart">
                      {['일','월','화','수','목','금','토'].map((day, idx) => {
                        const hours = weekData[idx] || 0;
                        const maxHours = Math.max(...weekData, 1);
                        const height = (hours / maxHours) * 100;
                        return (
                          <div className="chart-bar" key={day} style={{height: `${Math.max(height, 10)}%`}} title={`${day}: ${hours.toFixed(1)}시간`} data-day={day}></div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="goals-progress">
                    <h3>목표별 진도</h3>
                    {goals.length === 0 ? (
                      <p>설정된 목표가 없습니다.</p>
                    ) : (
                      goals.map((goal: any) => (
                        <div className="goal-progress-item" key={goal.id}>
                          <div className="goal-progress-info">
                            <h4>{goal.title}</h4>
                            <p>{CATEGORY_MAP[goal.category] || goal.category}</p>
                          </div>
                          <div className="goal-progress-percent">{(goal.progress || 0).toFixed(1)}%</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
} 