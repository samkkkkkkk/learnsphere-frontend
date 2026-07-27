import { useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

const topics = [
  { key: 'react', label: 'React', desc: '프론트엔드 라이브러리', available: true },
  { key: 'UniTask', label: 'UniTask', desc: '비동기 프로그래밍', available: false },
  // { key: 'ml', label: 'Machine Learning', desc: '머신러닝 기초', available: false },
  { key: 'python', label: 'Python', desc: '프로그래밍 언어', available: false },
];

export default function MainPage() {
  const [selectedTopic, setSelectedTopic] = useState('react');
  const navigate = useNavigate();

  const handleTopicClick = (key: string, available: boolean) => {
    if (!available) return;
    setSelectedTopic(key);
  };

  const handleGenerate = () => {
    navigate('/roadmap', { state: { topic: selectedTopic } });
  };

  return (
    <div>
      <main className="container">
        <div id="selection-form">
          <div className="hero-section">
            <p className="hero-eyebrow">learnsphere init --level=beginner</p>
            <h1>막막함은 끝.<br />학습 경로를 <em>컴파일</em>하세요.</h1>
            <p className="hero-description">수준별 로드맵부터 레슨·퀴즈·질문까지. 검증된 자료를 근거로 답하는 학습 도우미와 함께, 지금 필요한 것부터 순서대로 배웁니다.</p>
            <div className="hero-features">
              <div className="feature-item feature-seal">
                <i className="fas fa-stamp"></i> <span>100% 검증된 자료</span>
                <small className="feature-sub">신뢰할 수 있는 소스에서 엄선됨</small>
              </div>
              <div className="feature-item feature-carved">
                <i className="fas fa-street-view"></i> <span>개인 맞춤형</span>
                <small className="feature-sub">당신의 학습 속도와 목표에 맞춤</small>
              </div>
              <div className="feature-item feature-leaf">
                <i className="fas fa-brain"></i> <span>AI 기반 설명</span>
                <small className="feature-sub">복잡한 개념을 명쾌하게 정리</small>
              </div>
            </div>
            <p className="hero-signature">Learning Hub 2024</p>
          </div>
          <div className="selection-card">
            <div className="card-header">
              <h3><i className="fas fa-book-open" aria-hidden="true"></i> 학습 로드맵 보기</h3>
              <p>원하는 주제를 선택하면, 수준별 학습 경로와 검증된 자료를 보여드립니다.</p>
            </div>
            <div className="form-section">
              <label className="section-label">학습 주제 선택</label>
              <div className="topic-grid">
                {topics.map((topic) => (
                  <div
                    key={topic.key}
                    className={`topic-option${selectedTopic === topic.key ? ' active' : ''}${!topic.available ? ' disabled' : ''}`}
                    onClick={() => handleTopicClick(topic.key, topic.available)}
                  >
                    <div className="topic-content">
                      <h4>{topic.label}</h4>
                      <p>{topic.desc}</p>
                    </div>
                    <div className={`topic-badge ${topic.available ? 'available' : 'coming-soon'}`}>{topic.available ? 'Available' : 'Coming Soon'}</div>
                  </div>
                ))}
              </div>
            </div>
            <button id="generateBtn" className="generate-btn" onClick={handleGenerate}>
              <i className="fas fa-sparkles" aria-hidden="true"></i> <span>로드맵 보기</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 