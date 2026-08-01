// AI피드백 탭 — 서버 LLM 피드백을 마크다운으로 렌더 (목업 제거)
import { useState } from 'react';
import * as learningApi from '../../api/learningApi';
import MarkdownRenderer from '../MarkdownRenderer';

export default function FeedbackTab() {
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleFeedback = async (type: learningApi.FeedbackType) => {
    setFeedbackLoading(true);
    setFeedbackResult(null);
    setFeedbackError(null);
    try {
      setFeedbackResult(await learningApi.requestFeedback(type));
    } catch {
      setFeedbackError('피드백을 받지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setFeedbackLoading(false);
    }
  };

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
            <button className="feedback-btn" disabled={feedbackLoading} onClick={() => void handleFeedback('content')}><i className="fas fa-book"></i> <span>학습 콘텐츠 추천</span></button>
            <button className="feedback-btn" disabled={feedbackLoading} onClick={() => void handleFeedback('schedule')}><i className="fas fa-clock"></i> <span>학습 분량 조절</span></button>
            <button className="feedback-btn" disabled={feedbackLoading} onClick={() => void handleFeedback('progress')}><i className="fas fa-chart-line"></i> <span>진도 분석</span></button>
            <button className="feedback-btn" disabled={feedbackLoading} onClick={() => void handleFeedback('motivation')}><i className="fas fa-fire"></i> <span>동기부여 메시지</span></button>
          </div>
        </div>
        <div className="feedback-result" id="feedbackResult">
          {feedbackLoading ? (
            <div className="feedback-loading">
              <div className="loading"></div>
              <p>AI가 분석 중입니다...</p>
            </div>
          ) : feedbackError ? (
            <div className="feedback-placeholder">
              <i className="fas fa-exclamation-circle"></i>
              <p>{feedbackError}</p>
            </div>
          ) : feedbackResult ? (
            <div className="feedback-content active">
              <MarkdownRenderer>{feedbackResult}</MarkdownRenderer>
            </div>
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
