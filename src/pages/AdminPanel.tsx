import { useState, useEffect, useCallback } from 'react';
import {
  triggerFullContentGeneration,
  checkServerHealth,
  fetchLessonIndex,
  fetchGenerations,
  fetchGenerationDetail,
  activateGeneration,
  fetchLessonVersions,
  restoreLessonVersion,
  setAdminApiKey,
  getAdminApiKey,
} from '../api/lessonApi';
import type { GenerationSummary, GenerationDetail, LessonVersionInfo } from '../api/lessonApi';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useToast } from '../components/ui/ToastContext';
import './AdminPanel.css';

type ServerStatus = {
  status: string;
  message?: string;
};

type LessonOption = { id: number; title: string; level: string; number: number };

/**
 * 관리자 패널 - React 학습 플랫폼 관리
 */
export default function AdminPanel() {
  const { showToast } = useToast();
  const [confirmGenerationId, setConfirmGenerationId] = useState<number | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 관리자 키 (sessionStorage 보관 — 입력해야 관리자 기능 활성화)
  const [adminKeyInput, setAdminKeyInput] = useState<string>(getAdminApiKey());
  const [hasAdminKey, setHasAdminKey] = useState<boolean>(!!getAdminApiKey());

  // 세대(generation) 패널
  const [generations, setGenerations] = useState<GenerationSummary[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationDetail | null>(null);
  const [isGenerationsLoading, setIsGenerationsLoading] = useState(false);

  // 레슨 버전 패널
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | ''>('');
  const [versions, setVersions] = useState<LessonVersionInfo[]>([]);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);

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
      const response = await checkServerHealth();
      setServerStatus(response);
    } catch (err) {
      console.error('서버 상태 확인 실패:', err);
      setServerStatus({
        status: 'error',
        message: '서버에 연결할 수 없습니다.'
      });
    }
  };

  /**
   * 관리자 키 저장
   */
  const handleSaveAdminKey = () => {
    setAdminApiKey(adminKeyInput.trim());
    const saved = !!adminKeyInput.trim();
    setHasAdminKey(saved);
    addLog(saved ? '관리자 키를 저장했습니다.' : '관리자 키를 지웠습니다.');
    if (saved) {
      loadGenerations();
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
      addLog(`콘텐츠 생성 시작 (generation ${response.generation_id}): ${response.message}`);
      setError(null);
      loadGenerations();
    } catch (err) {
      console.error('콘텐츠 생성 요청 실패:', err);
      addLog('콘텐츠 생성 요청 실패 (키 인증/중복 실행 여부를 확인하세요)');
      setError('콘텐츠 생성 요청에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 세대 목록 조회
   */
  const loadGenerations = useCallback(async () => {
    if (!getAdminApiKey()) return;
    setIsGenerationsLoading(true);
    try {
      const data = await fetchGenerations();
      setGenerations(data);
    } catch (err) {
      console.error('세대 목록 조회 실패:', err);
      setGenerations([]);
      addLog('세대 목록 조회 실패 (관리자 키를 확인하세요)');
    } finally {
      setIsGenerationsLoading(false);
    }
  }, []);

  /**
   * 세대 상세(실패 토픽) 조회
   */
  const handleSelectGeneration = async (generationId: number) => {
    try {
      const detail = await fetchGenerationDetail(generationId);
      setSelectedGeneration(detail);
    } catch (err) {
      console.error('세대 상세 조회 실패:', err);
      addLog('세대 상세 조회 실패');
    }
  };

  /**
   * 특정 세대로 일괄 전환
   */
  const handleActivateGeneration = async (generationId: number) => {
    setConfirmGenerationId(null);
    try {
      await activateGeneration(generationId);
      addLog(`generation ${generationId}(으)로 전환 완료`);
      showToast(`generation ${generationId}(으)로 전환했습니다.`, 'success');
      loadGenerations();
      if (selectedLessonId !== '') loadVersions(selectedLessonId);
    } catch (err) {
      console.error('세대 전환 실패:', err);
      addLog('세대 전환 실패');
      showToast('전환에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
    }
  };

  /**
   * 레슨 목록(버전 패널 선택지) 조회 — 공개 API라 키 불필요
   */
  const loadLessonOptions = useCallback(async () => {
    try {
      const index = await fetchLessonIndex();
      const options: LessonOption[] = [];
      Object.entries(index).forEach(([level, lessons]) => {
        lessons.forEach(lesson => options.push({ ...lesson, level }));
      });
      setLessonOptions(options);
    } catch (err) {
      console.error('레슨 목록 조회 실패:', err);
      setLessonOptions([]);
    }
  }, []);

  /**
   * 선택한 레슨의 버전 목록 조회
   */
  const loadVersions = async (lessonId: number) => {
    setIsVersionsLoading(true);
    try {
      const data = await fetchLessonVersions(lessonId);
      setVersions(data);
      addLog(`레슨 ${lessonId}의 버전 ${data.length}개를 불러왔습니다.`);
    } catch (err) {
      console.error('버전 목록 조회 실패:', err);
      setVersions([]);
      addLog('버전 목록 조회 실패');
    } finally {
      setIsVersionsLoading(false);
    }
  };

  /**
   * 특정 버전으로 복원
   */
  const handleRestoreVersion = async (versionId: number) => {
    if (selectedLessonId === '') return;
    try {
      await restoreLessonVersion(selectedLessonId, versionId, 'admin');
      addLog(`레슨 ${selectedLessonId}을(를) 버전 ${versionId}(으)로 복원했습니다.`);
      showToast('버전 복원이 완료되었습니다.', 'success');
      loadVersions(selectedLessonId);
    } catch (err) {
      console.error('복원 실패:', err);
      addLog('복원 실패');
      showToast('복원에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
    }
  };

  /**
   * 컴포넌트 마운트 시 서버 상태/목록 로드
   */
  useEffect(() => {
    checkServerStatus();
    loadLessonOptions();
    loadGenerations();
    const interval = setInterval(checkServerStatus, 30000); // 30초마다 상태 확인
    return () => clearInterval(interval);
  }, [loadGenerations, loadLessonOptions]);

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>🔧 React 학습 플랫폼 관리자 패널</h1>
        <p>AI 기반 학습 콘텐츠 생성 및 서버 관리를 담당합니다.</p>
      </header>

      {/* 관리자 키 입력 */}
      <div className="admin-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="관리자 API 키 (X-Admin-API-Key)"
            value={adminKeyInput}
            onChange={e => setAdminKeyInput(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', minWidth: 280 }}
            autoComplete="off"
          />
          <button className="control-btn primary" onClick={handleSaveAdminKey}>
            키 저장
          </button>
          <span>{hasAdminKey ? '🔑 키 저장됨' : '⚠️ 키를 입력해야 관리자 기능을 사용할 수 있습니다'}</span>
        </div>
        <div className="control-buttons">
          <button
            className="control-btn primary"
            onClick={() => { checkServerStatus(); loadGenerations(); }}
          >
            🔄 상태 확인
          </button>
          <button
            className="control-btn warning"
            onClick={startContentGeneration}
            disabled={isGenerating || !hasAdminKey || serverStatus?.status !== 'ok'}
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

        {/* 세대(generation) 관리 */}
        <div className="backup-tree-panel">
          <h3>📂 생성 세대 관리</h3>
          {!hasAdminKey ? (
            <div>관리자 키를 저장하면 세대 목록을 볼 수 있습니다.</div>
          ) : isGenerationsLoading ? (
            <div>로딩 중...</div>
          ) : generations.length === 0 ? (
            <div>세대가 없습니다.</div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>소스</th>
                    <th>상태</th>
                    <th>시작</th>
                    <th>성공/전체</th>
                    <th>실패</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {generations.map(g => (
                    <tr key={g.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectGeneration(g.id)}>
                      <td>{g.id}</td>
                      <td>{g.source}</td>
                      <td>{g.status}</td>
                      <td>{g.started_at ? new Date(g.started_at).toLocaleString() : '-'}</td>
                      <td>{g.succeeded ?? '-'}/{g.total_topics ?? '-'}</td>
                      <td>{g.failed_count}</td>
                      <td>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmGenerationId(g.id); }}
                          disabled={g.status !== 'completed'}
                          style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#3b82f6', color: '#fff', border: 'none' }}
                        >
                          이 세대로 전환
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedGeneration && (
                <div style={{ marginTop: 12, background: '#f8f9fa', borderRadius: 8, padding: '0.8rem' }}>
                  <strong>generation {selectedGeneration.id} 실패 토픽 ({selectedGeneration.failed_topics.length})</strong>
                  {selectedGeneration.failed_topics.length === 0 ? (
                    <div>실패한 토픽이 없습니다.</div>
                  ) : (
                    <ul style={{ marginLeft: 16, maxHeight: 150, overflowY: 'auto' }}>
                      {selectedGeneration.failed_topics.map((f, i) => (
                        <li key={i} style={{ fontSize: '0.92rem' }}>
                          [{f.level}] {f.topic} — {f.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 레슨 버전 관리 */}
        <div className="backup-panel">
          <h3>🗂️ 레슨 버전 관리</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <select
              value={selectedLessonId}
              onChange={e => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setSelectedLessonId(value);
                setVersions([]);
                if (value !== '' && hasAdminKey) loadVersions(value);
              }}
              style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', minWidth: 320 }}
            >
              <option value="">레슨을 선택하세요</option>
              {lessonOptions.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {`[${lesson.level}] ${lesson.number}. ${lesson.title}`}
                </option>
              ))}
            </select>
            {!hasAdminKey && <span>⚠️ 버전 조회에는 관리자 키가 필요합니다</span>}
          </div>
          {isVersionsLoading ? (
            <div>로딩 중...</div>
          ) : versions.length > 0 && (
            <div className="backup-list" style={{ maxHeight: 300, overflowY: 'auto', background: '#f8f9fa', borderRadius: 8, padding: '1rem' }}>
              <table style={{ width: '100%', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th>버전ID</th>
                    <th>세대</th>
                    <th>제목</th>
                    <th>생성일시</th>
                    <th>소스</th>
                    <th>상태</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map(v => (
                    <tr key={v.version_id}>
                      <td>{v.version_id}</td>
                      <td>{v.generation_id}</td>
                      <td>{v.title}</td>
                      <td>{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</td>
                      <td>{v.source || '-'}</td>
                      <td>{v.is_current ? '✅ 활성' : ''}</td>
                      <td>
                        {!v.is_current && (
                          <button
                            onClick={() => handleRestoreVersion(v.version_id)}
                            style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#3b82f6', color: '#fff', border: 'none' }}
                          >
                            복원
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <strong>콘텐츠 생성:</strong> React 공식 문서 기반 · 레슨은 DB(세대/버전)로 관리
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmGenerationId !== null}
        title="세대 전환"
        message={`generation ${confirmGenerationId}의 레슨으로 전체 전환합니다. 계속할까요?`}
        confirmLabel="전환"
        onConfirm={() => {
          if (confirmGenerationId !== null) void handleActivateGeneration(confirmGenerationId);
        }}
        onCancel={() => setConfirmGenerationId(null)}
      />
    </div>
  );
}
