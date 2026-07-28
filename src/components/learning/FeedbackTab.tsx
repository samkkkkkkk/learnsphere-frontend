// AI피드백 탭 (LearningManagerPage에서 분리 — P11에서 실제 LLM 연동으로 교체 예정)
import { useState } from 'react';
import { type Goal, type Schedule } from './useLearningData';

type Props = {
  goals: Goal[];
  schedules: Schedule[];
};

export default function FeedbackTab({ goals, schedules }: Props) {
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null);

  const handleFeedback = (type: string) => {
    setFeedbackLoading(true);
    setFeedbackResult(null);
    setTimeout(() => {
      setFeedbackLoading(false);
      setFeedbackResult(getAIFeedback(type));
    }, 1200);
  };

  function getAIFeedback(type: string) {
    const completedSchedules = schedules.filter((s) => s.completed).length;
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
      return `<h4><i class='fas fa-fire'></i> 동기부여 메시지</h4><p><strong>🌟 당신은 이미 훌륭한 학습자입니다!</strong></p><p>지금까지의 노력이 결실을 맺고 있습니다. ${completedSchedules}개의 학습 세션을 완료하신 것은 정말 대단한 성과입니다.</p><div style="background: linear-gradient(135deg, #c47a5a, #a55f42); color: white; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;"><h4 style="margin-bottom: 1rem;">💪 오늘의 동기부여</h4><p style="font-style: italic; margin-bottom: 0;">"성공은 매일매일의 작은 노력이 쌓여서 만들어지는 것입니다. 오늘도 한 걸음 더 나아가세요!"</p></div><ul class='feedback-list'><li><i class='fas fa-check'></i> 매일 조금씩이라도 꾸준히 하세요</li><li><i class='fas fa-check'></i> 완벽하지 않아도 괜찮습니다</li><li><i class='fas fa-check'></i> 진전이 있다면 자신을 칭찬하세요</li><li><i class='fas fa-check'></i> 목표를 달성한 미래의 자신을 상상해보세요</li></ul>`;
    }
    return '';
  }

  return (
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
  );
}
