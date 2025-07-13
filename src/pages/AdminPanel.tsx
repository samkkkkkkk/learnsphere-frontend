import { useState, useEffect } from 'react';
import axios from 'axios';
import { triggerFullContentGeneration, checkServerHealth, fetchLessonBackups, restoreLessonBackup, fetchLessonIndex, fetchBackupList, restoreBackupDate } from '../api/lessonApi';
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
  const [backupLessonFilename, setBackupLessonFilename] = useState('');
  const [backups, setBackups] = useState<any[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [lessonFiles, setLessonFiles] = useState<{ filename: string; title: string; level: string }[]>([]);
  const [backupTree, setBackupTree] = useState<{ [date: string]: string[] }>({});
  const [isBackupTreeLoading, setIsBackupTreeLoading] = useState(false);
  const [selectedBackupDate, setSelectedBackupDate] = useState<string | null>(null);

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

  // 레슨 파일 목록 불러오기
  useEffect(() => {
    const loadLessonFiles = async () => {
      try {
        const index = await fetchLessonIndex();
        // 평탄화: [{filename, title, level} ...]
        const files: { filename: string; title: string; level: string }[] = [];
        Object.entries(index).forEach(([level, arr]) => {
          arr.forEach((item: any) => files.push({ ...item, level }));
        });
        setLessonFiles(files);
      } catch (e) {
        setLessonFiles([]);
      }
    };
    loadLessonFiles();
  }, []);

  // 날짜별 백업 목록 불러오기
  useEffect(() => {
    const loadBackupTree = async () => {
      setIsBackupTreeLoading(true);
      try {
        const tree = await fetchBackupList();
        setBackupTree(tree);
      } catch (e) {
        setBackupTree({});
      } finally {
        setIsBackupTreeLoading(false);
      }
    };
    loadBackupTree();
  }, []);

  // 자동완성/드롭다운에서 선택/입력 시 백업 목록 자동 조회
  useEffect(() => {
    if (!backupLessonFilename) return;
    let found = lessonFiles.find(f => f.filename === backupLessonFilename);
    if (found) handleFetchBackups(found.filename);
    // eslint-disable-next-line
  }, [backupLessonFilename]);

  // 백업 목록 조회
  const handleFetchBackups = async (filename: string) => {
    setIsBackupLoading(true);
    try {
      const data = await fetchLessonBackups(filename);
      setBackups(data);
      setShowBackups(true);
      addLog(`${filename}의 백업 목록을 불러왔습니다.`);
    } catch (e) {
      setBackups([]);
      setShowBackups(true);
      addLog('백업 목록 조회 실패');
    } finally {
      setIsBackupLoading(false);
    }
  };

  // 복원
  const handleRestoreBackup = async (backupId: number) => {
    try {
      await restoreLessonBackup(backupId, 'admin');
      addLog('백업 복원 완료!');
      alert('복원 완료!');
      setShowBackups(false);
    } catch (e) {
      addLog('복원 실패');
      alert('복원 실패');
    }
  };

  // 날짜별 전체 복원
  const handleRestoreBackupDate = async (date: string) => {
    if (!window.confirm(`${date}의 모든 백업 파일로 전체 복원하시겠습니까?`)) return;
    try {
      await restoreBackupDate(date);
      addLog(`${date} 전체 복원 완료!`);
      alert(`${date} 전체 복원 완료!`);
    } catch (e) {
      addLog('전체 복원 실패');
      alert('전체 복원 실패');
    }
  };

  // 날짜별 개별 파일 복원
  const handleRestoreBackupFile = async (date: string, filename: string) => {
    try {
      // 개별 파일 복원은 기존 restoreLessonBackup API 사용
      // backup_filename은 date/filename 형태
      const backupFilename = `${date}/${filename}`;
      // DB에서 해당 backup_filename을 가진 LessonBackup의 id를 찾아야 함
      // 여기서는 간단히 백엔드에 별도 API가 없으므로, 기존대로 레슨별 복원 UI를 권장
      alert('개별 파일 복원은 레슨별 복원 UI를 이용해 주세요. (또는 별도 API 필요)');
    } catch (e) {
      addLog('개별 복원 실패');
      alert('개별 복원 실패');
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

        {/* 날짜별 백업 트리/전체 복원 UI */}
        <div className="backup-tree-panel">
          <h3>📂 날짜별 전체 백업/복원</h3>
          {isBackupTreeLoading ? (
            <div>로딩 중...</div>
          ) : Object.keys(backupTree).length === 0 ? (
            <div>백업 폴더가 없습니다.</div>
          ) : (
            <div style={{ maxWidth: 400, marginBottom: '2rem' }}>
              <label>
                날짜 선택:{' '}
                <select
                  value={selectedBackupDate || ''}
                  onChange={e => setSelectedBackupDate(e.target.value)}
                  style={{ padding: '0.4rem', borderRadius: 4, minWidth: 160 }}
                >
                  <option value="">날짜를 선택하세요</option>
                  {Object.keys(backupTree).sort().reverse().map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </label>
              {selectedBackupDate && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 4 }}>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedBackupDate}</strong>
                    <button onClick={() => handleRestoreBackupDate(selectedBackupDate)} style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#3b82f6', color: '#fff', border: 'none' }}>
                      전체 복원
                    </button>
                  </div>
                  <ul style={{ marginLeft: 16, maxHeight: 200, overflowY: 'auto' }}>
                    {backupTree[selectedBackupDate].map(f => (
                      <li key={f} style={{ marginBottom: 2, fontSize: '0.97rem' }}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="backup-panel">
          <h3>🗂️ 레슨 백업/복원</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              list="lesson-file-list"
              placeholder="레슨 파일명 선택 또는 입력"
              value={backupLessonFilename}
              onChange={e => setBackupLessonFilename(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', minWidth: 260 }}
              autoComplete="off"
            />
            <datalist id="lesson-file-list">
              {lessonFiles.map(f => (
                <option key={f.filename} value={f.filename}>{`${f.title} (${f.level})`}</option>
              ))}
            </datalist>
          </div>
          {showBackups && (
            <div className="backup-list" style={{ maxHeight: 300, overflowY: 'auto', background: '#f8f9fa', borderRadius: 8, padding: '1rem' }}>
              {backups.length === 0 ? (
                <div>백업이 없습니다.</div>
              ) : (
                <table style={{ width: '100%', fontSize: '0.95rem' }}>
                  <thead>
                    <tr>
                      <th>백업ID</th>
                      <th>파일명</th>
                      <th>생성일시</th>
                      <th>생성자</th>
                      <th>액션</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map(b => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.backup_filename}</td>
                        <td>{b.created_at ? new Date(b.created_at).toLocaleString() : ''}</td>
                        <td>{b.created_by || '-'}</td>
                        <td>{b.action}</td>
                        <td>
                          <button onClick={() => handleRestoreBackup(b.id)} style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#3b82f6', color: '#fff', border: 'none' }}>
                            복원
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
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