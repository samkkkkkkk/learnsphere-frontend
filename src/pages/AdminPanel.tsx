import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

type ServerStatus = {
  status: string;
  validated_files_count?: number;
  available_levels?: string[];
  cache_status?: {
    cache_size: number;
    last_update: number;
    is_valid: boolean;
  };
  error?: string;
};

/**
 * 관리자 패널 - 검증된 JSON 서버 관리
 */
export default function AdminPanel() {
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:8001');
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

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
      const response = await axios.get(`${serverUrl}/api/status`);
      setServerStatus(response.data);
      addLog(`서버 상태: ${response.data.status}`);
    } catch (err: any) {
      console.error('서버 상태 확인 실패:', err);
      setServerStatus({
        status: 'error',
        error: '서버에 연결할 수 없습니다.'
      });
      addLog('서버 연결 실패');
    }
  };

  /**
   * 서버 캐시 초기화
   */
  const clearServerCache = async () => {
    try {
      setIsLoading(true);
      addLog('캐시 초기화 요청 중...');
      await axios.post(`${serverUrl}/api/cache/clear`);
      await checkServerStatus();
      addLog('캐시 초기화 완료');
    } catch (err) {
      console.error('캐시 초기화 실패:', err);
      addLog('캐시 초기화 실패');
      setError('캐시 초기화에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 서버 재시작 시뮬레이션
   */
  const restartServer = async () => {
    try {
      setIsLoading(true);
      addLog('서버 재시작 시뮬레이션 중...');
      // 실제로는 서버 프로세스를 재시작해야 하지만, 여기서는 상태만 리셋
      setServerStatus(null);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkServerStatus();
      addLog('서버 재시작 완료');
    } catch (err) {
      addLog('서버 재시작 실패');
      setError('서버 재시작에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 서버 상태 확인
   */
  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // 30초마다 상태 확인
    return () => clearInterval(interval);
  }, [serverUrl]);

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>🔧 React 학습 서버 관리자 패널</h1>
        <p>검증된 JSON 서버의 상태를 모니터링하고 관리합니다.</p>
      </header>

      <div className="admin-controls">
        <div className="control-group">
          <label htmlFor="server-url">서버 URL</label>
          <input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:8001"
          />
        </div>

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
            onClick={clearServerCache}
            disabled={isLoading || serverStatus?.status !== 'running'}
          >
            🗑️ 캐시 초기화
          </button>
          <button 
            className="control-btn danger"
            onClick={restartServer}
            disabled={isLoading}
          >
            🔄 서버 재시작
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
                  {serverStatus.status === 'running' ? '🟢 실행 중' : 
                   serverStatus.status === 'no_validated_files' ? '🟡 파일 없음' : 
                   '🔴 오류'}
                </span>
              </div>
              
              {serverStatus.validated_files_count !== undefined && (
                <div className="status-item">
                  <span className="status-label">검증된 파일:</span>
                  <span className="status-value">{serverStatus.validated_files_count}개</span>
                </div>
              )}
              
              {serverStatus.available_levels && (
                <div className="status-item">
                  <span className="status-label">사용 가능한 레벨:</span>
                  <span className="status-value">{serverStatus.available_levels.join(', ')}</span>
                </div>
              )}
              
              {serverStatus.cache_status && (
                <div className="status-item">
                  <span className="status-label">캐시 상태:</span>
                  <span className="status-value">
                    크기: {serverStatus.cache_status.cache_size}개, 
                    유효: {serverStatus.cache_status.is_valid ? '✅' : '❌'}
                  </span>
                </div>
              )}
              
              {serverStatus.error && (
                <div className="status-item error">
                  <span className="status-label">오류:</span>
                  <span className="status-value">{serverStatus.error}</span>
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
      </div>

      {isLoading && (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>작업 중...</p>
        </div>
      )}
    </div>
  );
} 