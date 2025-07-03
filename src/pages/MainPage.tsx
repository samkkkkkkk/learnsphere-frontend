import React, { useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

const mockRoadmapData = {
  roadmapTitle: 'React 초보자를 위한 핵심 정복 로드맵',
  totalDuration: '4-6주 예상',
  steps: [
    {
      step: 1,
      title: '기초 다지기: React 핵심 개념 정복',
      explanation:
        "가장 먼저 공식 문서를 통해 '왜 React가 필요한지', '컴포넌트가 무엇인지' 등 뼈대를 잡는 것이 중요합니다. 이 단계를 거치면 React의 철학과 기본 구조를 이해할 수 있습니다. JSX 문법, 컴포넌트의 개념, Props와 State의 차이점을 명확히 이해하는 것이 핵심입니다.",
      resourceTitle: 'React 공식 문서 - 주요 개념',
      resourceUrl: 'https://react.dev/learn',
      resourceDescription:
        'React의 가장 기본이 되는 JSX, 컴포넌트, Props, State 개념을 가장 정확하게 배울 수 있는 자료입니다.',
      duration: '1-2주',
      difficulty: '기초',
    },
    {
      step: 2,
      title: '실전 감각 익히기: 첫 React 프로젝트',
      explanation:
        '개념만 아는 것과 직접 만들어보는 것은 큰 차이가 있습니다. 이 강의는 실제 프로젝트를 만들면서 React의 작동 방식을 직관적으로 이해할 수 있게 도와줍니다. 영화 웹 서비스를 만들면서 컴포넌트 설계, 상태 관리, API 연동 등 실무에서 필요한 핵심 스킬을 익힐 수 있습니다.',
      resourceTitle: '니코쌤의 ReactJS로 영화 웹 서비스 만들기',
      resourceUrl: 'https://nomadcoders.co/react-for-beginners',
      resourceDescription:
        '실습 프로젝트를 통해 React의 작동 방식을 직관적으로 이해할 수 있는 최고의 입문 강의입니다.',
      duration: '2-3주',
      difficulty: '초급',
    },
    {
      step: 3,
      title: '상태 관리 맛보기: React의 핵심 이해하기',
      explanation:
        'React의 가장 중요한 개념인 상태(State) 관리를 깊이 있게 학습합니다. useState, useEffect 등의 Hook을 활용한 상태 관리부터 시작해서, 컴포넌트 간 데이터 전달, 상태 끌어올리기 등의 패턴을 익힙니다. 이 단계를 마스터하면 더 복잡한 애플리케이션도 자신 있게 만들 수 있습니다.',
      resourceTitle: 'React State 관리 완벽 가이드',
      resourceUrl: 'https://react.dev/learn/managing-state',
      resourceDescription:
        'React의 상태 관리 개념을 체계적으로 학습할 수 있는 공식 가이드입니다.',
      duration: '1-2주',
      difficulty: '초급+',
    },
  ],
};

const topics = [
  { key: 'react', label: 'React', desc: '프론트엔드 라이브러리', available: true },
  { key: 'ml', label: 'Machine Learning', desc: '머신러닝 기초', available: true },
  { key: 'python', label: 'Python', desc: '프로그래밍 언어', available: true },
];

export default function MainPage() {
  const [selectedTopic, setSelectedTopic] = useState('react');
  const navigate = useNavigate();
  const [showResults] = useState(false);

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