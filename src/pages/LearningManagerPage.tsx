// 학습 매니저 — 탭 셸. 데이터는 useLearningData 훅, 탭 UI는 components/learning/*.
import { useState } from 'react';
// 이 페이지만 Font Awesome을 쓰므로 라우트 청크에서 지역 로드한다 (초기 번들 제외)
import '@fortawesome/fontawesome-free/css/all.min.css';
import './LearningManagerPage.css';
import FeedbackTab from '../components/learning/FeedbackTab';
import GoalsTab from '../components/learning/GoalsTab';
import LearningLoginPrompt from '../components/learning/LearningLoginPrompt';
import ProgressTab from '../components/learning/ProgressTab';
import ScheduleTab from '../components/learning/ScheduleTab';
import { useLearningData } from '../components/learning/useLearningData';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';

export default function LearningManagerPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('goals');
  const data = useLearningData();

  // 토큰 복원이 끝나기 전에는 로그인 여부를 단정할 수 없다 (깜빡임 방지)
  if (isLoading) return <Spinner label="학습 매니저를 불러오는 중" />;
  if (!user) return <LearningLoginPrompt />;

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
              updateScheduleItem={data.updateScheduleItem}
              deleteScheduleItem={data.deleteScheduleItem}
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
