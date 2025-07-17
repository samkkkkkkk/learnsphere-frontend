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
            <h2>AI가 만드는 맞춤형 학습 로드맵</h2>
            <p className="hero-description">검증된 고품질 자료만을 엄선하여, AI가 당신만을 위한 완벽한 학습 경로를 설계합니다.</p>
            <div className="hero-features">
              <div className="feature-item"><i className="fas fa-check-circle"></i> <span>100% 검증된 자료</span></div>
              <div className="feature-item"><i className="fas fa-bullseye"></i> <span>개인 맞춤형</span></div>
              <div className="feature-item"><i className="fas fa-bolt"></i> <span>AI 기반 설명</span></div>
            </div>
          </div>
          <div className="selection-card">
            <div className="card-header">
              <h3><i className="fas fa-book-open"></i> 학습 로드맵 생성하기</h3>
              <p>원하는 주제를 선택하면, AI가 최적의 학습 경로를 만들어드립니다.</p>
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
              <i className="fas fa-sparkles"></i> <span>로드맵 생성하기</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 