// 진도현황 탭 — 대시보드 카드 + 주간 차트 (LearningManagerPage에서 분리)
// P9에서 로컬 계산을 서버 dashboard API로 교체 예정.
import { getStartOfWeek, toLocalDateStr } from './dateUtils';
import { CATEGORY_MAP, type Goal, type Schedule } from './useLearningData';

type Props = {
  goals: Goal[];
  schedules: Schedule[];
};

export default function ProgressTab({ goals, schedules }: Props) {
  const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0;
  const completedGoals = goals.filter((g) => (g.progress || 0) >= 100).length;
  const thisWeekSchedules = schedules.filter((s) => {
    const start = getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const scheduleDate = new Date(s.date);
    return scheduleDate >= start && scheduleDate <= end;
  });
  const completedHours = thisWeekSchedules.filter((s) => s.completed).reduce((sum, s) => sum + s.duration, 0) / 60;

  // Streak 계산
  function calculateStreak() {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = toLocalDateStr(date);
      const daySchedules = schedules.filter((s) => s.date === dateString && s.completed);
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
    const weekData = new Array(7).fill(0);
    schedules.forEach((s) => {
      if (s.completed) {
        const dayOfWeek = new Date(s.date).getDay();
        weekData[dayOfWeek] += s.duration / 60;
      }
    });
    return weekData;
  }
  const weekData = getWeeklyStudyData();

  return (
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
              goals.map((goal) => (
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
  );
}
