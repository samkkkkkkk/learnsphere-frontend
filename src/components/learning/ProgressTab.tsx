// 진도현황 탭 — 서버 대시보드 통계로 렌더 (로컬 계산 없음)
import { useEffect, useState } from 'react';
import * as learningApi from '../../api/learningApi';
import { useToast } from '../ui/ToastContext';
import { CATEGORY_MAP, type Goal, type Schedule } from './useLearningData';

type Props = {
  goals: Goal[];
  /** 일정 완료 토글 등으로 통계가 바뀌었음을 알리는 신호 — 바뀔 때 재조회 */
  schedules: Schedule[];
};

const EMPTY_STATS: learningApi.DashboardStats = {
  overall_progress: 0,
  completed_goals: 0,
  total_goals: 0,
  weekly_hours: 0,
  weekly_pattern: [0, 0, 0, 0, 0, 0, 0],
  current_streak: 0,
  best_streak: 0,
};

export default function ProgressTab({ goals, schedules }: Props) {
  const { showToast } = useToast();
  const [stats, setStats] = useState<learningApi.DashboardStats>(EMPTY_STATS);

  useEffect(() => {
    let cancelled = false;
    learningApi.fetchDashboard()
      .then((loaded) => { if (!cancelled) setStats(loaded); })
      .catch(() => { if (!cancelled) showToast('진도 통계를 불러오지 못했습니다.', 'error'); });
    return () => { cancelled = true; };
    // schedules가 바뀌면(완료 토글 등) 통계를 다시 읽는다
  }, [schedules, showToast]);

  const weekData = stats.weekly_pattern;

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
            <div className="progress-value" id="overallProgress">{stats.overall_progress.toFixed(1)}%</div>
            <div className="progress-bar">
              <div className="progress-fill" id="overallProgressBar" style={{width: `${stats.overall_progress}%`}}></div>
            </div>
          </div>
          <div className="progress-card">
            <div className="progress-card-header">
              <h3>이번 주 학습시간</h3>
              <i className="fas fa-clock"></i>
            </div>
            <div className="progress-value" id="weeklyHours">{stats.weekly_hours.toFixed(1)}시간</div>
            <div className="progress-subtitle">목표: 7시간</div>
          </div>
          <div className="progress-card">
            <div className="progress-card-header">
              <h3>연속 학습일</h3>
              <i className="fas fa-fire"></i>
            </div>
            <div className="progress-value" id="streakDays">{stats.current_streak}일</div>
            <div className="progress-subtitle">최고 기록: {stats.best_streak}일</div>
          </div>
          <div className="progress-card">
            <div className="progress-card-header">
              <h3>완료된 목표</h3>
              <i className="fas fa-trophy"></i>
            </div>
            <div className="progress-value" id="completedGoals">{stats.completed_goals}개</div>
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
