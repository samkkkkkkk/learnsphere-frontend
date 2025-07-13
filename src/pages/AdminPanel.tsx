import { useState, useEffect } from 'react';
import axios from 'axios';
import { triggerFullContentGeneration, checkServerHealth } from '../api/lessonApi';
import './AdminPanel.css';

type ServerStatus = {
  status: string;
  message?: string;
};

/**
 * 관리자 패널 - React 학습 플랫폼 관리
 */
export default function AdminPanel() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  /**
   * 로그 추가
   */
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  /**
   * 서버 상태 확인
   */
  const checkServerStatus = async () => {
    try {
      addLog('서버 상태 확인 중...');
      const response = await checkServerHealth();
      setServerStatus(response);
      addLog(`서버 상태: ${response.status}`);
    } catch (err: any) {
      console.error('서버 상태 확인 실패:', err);
      setServerStatus({
        status: 'error',
        message: '서버에 연결할 수 없습니다.'
      });
      addLog('서버 연결 실패');
    }
  };

  /**
   * 전체 콘텐츠 생성 시작
   */
  const startContentGeneration = async () => {
    try {
      setIsGenerating(true);
      addLog('전체 콘텐츠 생성 요청 중...');
      const response = await triggerFullContentGeneration();
      addLog(`콘텐츠 생성 시작: ${response.message}`);
      setError(null);
    } catch (err: any) {
      console.error('콘텐츠 생성 요청 실패:', err);
      addLog('콘텐츠 생성 요청 실패');
      setError('콘텐츠 생성 요청에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 서버 상태 확인
   */
  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // 30초마다 상태 확인
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>🔧 React 학습 플랫폼 관리자 패널</h1>
        <p>AI 기반 학습 콘텐츠 생성 및 서버 관리를 담당합니다.</p>
      </header>

      <div className="admin-controls">
        <div className="control-buttons">
          <button 
            className="control-btn primary"
            onClick={checkServerStatus}
            disabled={isLoading}
          >
            🔄 상태 확인
          </button>
          <button 
            className="control-btn warning"
            onClick={startContentGeneration}
            disabled={isGenerating || serverStatus?.status !== 'ok'}
          >
            {isGenerating ? '생성 중...' : '🚀 전체 콘텐츠 생성'}
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-content">
        <div className="status-panel">
          <h3>📊 서버 상태</h3>
          {serverStatus ? (
            <div className="status-details">
              <div className="status-item">
                <span className="status-label">상태:</span>
                <span className={`status-value ${serverStatus.status}`}>
                  {serverStatus.status === 'ok' ? '🟢 정상' : '🔴 오류'}
                </span>
              </div>
              
              {serverStatus.message && (
                <div className="status-item">
                  <span className="status-label">메시지:</span>
                  <span className="status-value">{serverStatus.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="status-loading">서버 상태 확인 중...</div>
          )}
        </div>

        <div className="logs-panel">
          <h3>📝 시스템 로그</h3>
          <div className="logs-container">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))
            ) : (
              <div className="no-logs">로그가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="info-panel">
          <h3>ℹ️ 시스템 정보</h3>
          <div className="info-content">
            <div className="info-item">
              <strong>백엔드 서버:</strong> FastAPI (Python)
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
              <strong>콘텐츠 생성:</strong> React 공식 문서 기반
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 