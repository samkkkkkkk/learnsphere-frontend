import { useState, useEffect } from 'react';
import { checkServerHealth } from '../api/lessonApi';
import './MainPage.css';

export default function MainPage() {
  const [serverStatus, setServerStatus] = useState<string>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkServerHealth();
        setServerStatus('connected');
        setError(null);
      } catch (err) {
        setServerStatus('disconnected');
        setError('백엔드 서버에 연결할 수 없습니다.');
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>🎓 LearnSphere - React 학습 플랫폼</h1>
        <p>AI 기반 React 학습 자료 생성 및 관리 시스템</p>
      </header>

      <div className="status-section">
        <h2>시스템 상태</h2>
        <div className={`status-indicator ${serverStatus}`}>
          {serverStatus === 'connected' && '🟢 백엔드 서버 연결됨'}
          {serverStatus === 'disconnected' && '🔴 백엔드 서버 연결 안됨'}
          {serverStatus === 'checking' && '🟡 서버 상태 확인 중...'}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="features-section">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📚 React 학습 자료</h3>
            <p>AI가 생성한 React 학습 자료를 확인하고 학습하세요.</p>
            <a href="/react-learn" className="feature-link">학습 시작</a>
          </div>
          
          <div className="feature-card">
            <h3>🎯 학습 관리</h3>
            <p>개인 학습 목표를 설정하고 진도를 관리하세요.</p>
            <a href="/learning-manager" className="feature-link">관리하기</a>
          </div>
          
          <div className="feature-card">
            <h3>🔧 관리자 패널</h3>
            <p>AI 콘텐츠 생성 및 시스템 관리를 담당합니다.</p>
            <a href="/admin" className="feature-link">관리자</a>
          </div>
          
          <div className="feature-card">
            <h3>🗺️ 학습 로드맵</h3>
            <p>React 학습 경로를 확인하고 계획을 세우세요.</p>
            <a href="/roadmap" className="feature-link">로드맵 보기</a>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>시스템 정보</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>프론트엔드:</strong> React + TypeScript
          </div>
          <div className="info-item">
            <strong>백엔드:</strong> FastAPI (Python)
          </div>
          <div className="info-item">
            <strong>AI 서비스:</strong> OpenAI GPT-4
          </div>
          <div className="info-item">
            <strong>벡터 DB:</strong> Qdrant
          </div>
          <div className="info-item">
            <strong>데이터베이스:</strong> PostgreSQL
          </div>
          <div className="info-item">
            <strong>콘텐츠:</strong> React 공식 문서 기반
          </div>
        </div>
      </div>
    </div>
  );
} 