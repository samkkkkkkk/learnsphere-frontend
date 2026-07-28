// 학습 매니저 — 탭 셸. 데이터는 useLearningData 훅, 탭 UI는 components/learning/*.
import { useState } from 'react';
// 이 페이지만 Font Awesome을 쓰므로 라우트 청크에서 지역 로드한다 (초기 번들 제외)
import '@fortawesome/fontawesome-free/css/all.min.css';
import './LearningManagerPage.css';
import FeedbackTab from '../components/learning/FeedbackTab';
import GoalsTab from '../components/learning/GoalsTab';
import ProgressTab from '../components/learning/ProgressTab';
import ScheduleTab from '../components/learning/ScheduleTab';
import { useLearningData } from '../components/learning/useLearningData';

export default function LearningManagerPage() {
  const [activeTab, setActiveTab] = useState('goals');
  const data = useLearningData();

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
      <div className="lm-main">
        <div className="container">
          {activeTab === 'goals' && (
            <GoalsTab
              goals={data.goals}
              addGoal={data.addGoal}
              updateGoal={data.updateGoal}
              deleteGoal={data.deleteGoal}
            />
          )}
          {activeTab === 'schedule' && (
            <ScheduleTab
              goals={data.goals}
              schedules={data.schedules}
              addSchedule={data.addSchedule}
              toggleScheduleComplete={data.toggleScheduleComplete}
            />
          )}
          {activeTab === 'feedback' && (
            <FeedbackTab goals={data.goals} schedules={data.schedules} />
          )}
          {activeTab === 'progress' && (
            <ProgressTab goals={data.goals} schedules={data.schedules} />
          )}
        </div>
      </div>
    </div>
  );
}
