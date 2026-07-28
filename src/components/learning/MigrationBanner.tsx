// 예전 localStorage 목표/일정을 서버로 옮기는 안내 배너.
// 업로드가 성공한 경우에만 로컬 키를 지운다 — 실패 시 데이터가 보존된다.
import { useState } from 'react';
import * as learningApi from '../../api/learningApi';
import ConfirmModal from '../ui/ConfirmModal';
import { useToast } from '../ui/ToastContext';

const LOCAL_KEYS = ['goals', 'schedules'] as const;

type LocalGoal = {
  id: number;
  title: string;
  category: string;
  deadline: string;
  description?: string;
  dailyStudyTime: number;
};

type LocalSchedule = {
  id: number;
  goalId: number;
  date: string;
  time: string;
  content: string;
  duration: number;
  completed: boolean;
};

function readLocal<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearLocal() {
  LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value) || min));

type Props = {
  onImported: () => void;
};

export default function MigrationBanner({ onImported }: Props) {
  const { showToast } = useToast();
  const [visible, setVisible] = useState(() =>
    readLocal<LocalGoal>('goals').length > 0 ||
    readLocal<LocalSchedule>('schedules').length > 0);
  const [uploading, setUploading] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!visible) return null;

  const handleImport = async () => {
    setUploading(true);
    try {
      const goals = readLocal<LocalGoal>('goals');
      const schedules = readLocal<LocalSchedule>('schedules');
      // 예전 데이터는 폼 검증을 안 거쳤을 수 있어 서버 허용 범위로 보정한다
      const result = await learningApi.importLocalData(
        goals.slice(0, 500).map((g) => ({
          local_id: g.id,
          title: String(g.title || '').slice(0, 255) || '이름 없는 목표',
          category: String(g.category || 'other').slice(0, 20),
          deadline: g.deadline,
          description: g.description ?? null,
          daily_study_time: clamp(Number(g.dailyStudyTime) || 60, 15, 480),
        })),
        schedules.slice(0, 500).map((s) => ({
          local_goal_id: s.goalId,
          date: s.date,
          time: s.time,
          content: String(s.content || '').slice(0, 255) || '학습',
          duration_minutes: clamp(Number(s.duration) || 60, 15, 300),
          completed: Boolean(s.completed),
        })),
      );
      clearLocal();
      setVisible(false);
      const skipped = result.schedules_skipped > 0
        ? ` (연결할 목표가 없는 일정 ${result.schedules_skipped}개 제외)` : '';
      showToast(
        `목표 ${result.goals_created}개, 일정 ${result.schedules_created}개를 가져왔습니다.${skipped}`,
        'success');
      onImported();
    } catch {
      showToast('데이터 가져오기에 실패했습니다. 로컬 데이터는 그대로 남아 있습니다.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDiscard = () => {
    clearLocal();
    setConfirmDiscard(false);
    setVisible(false);
    showToast('이전 브라우저 데이터를 삭제했습니다.', 'info');
  };

  return (
    <div className="lm-migration-banner" role="region" aria-label="이전 데이터 가져오기">
      <i className="fas fa-cloud-upload-alt" aria-hidden="true"></i>
      <p>
        이 브라우저에 저장된 이전 목표/일정이 있습니다.
        계정으로 가져오면 다른 기기에서도 볼 수 있습니다.
      </p>
      <div className="lm-migration-actions">
        <button className="btn btn-primary" onClick={handleImport} disabled={uploading}>
          {uploading ? '가져오는 중…' : '계정으로 가져오기'}
        </button>
        <button className="btn btn-outline" onClick={() => setConfirmDiscard(true)} disabled={uploading}>
          무시
        </button>
      </div>
      <ConfirmModal
        open={confirmDiscard}
        title="이전 데이터 삭제"
        message="가져오지 않고 이 브라우저의 이전 목표/일정 데이터를 삭제할까요? 삭제하면 되돌릴 수 없습니다."
        confirmLabel="삭제"
        danger
        onConfirm={handleDiscard}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
