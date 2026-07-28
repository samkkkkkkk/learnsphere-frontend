// 학습 매니저 데이터 훅.
// 목표(P4)는 서버 저장, 일정은 아직 localStorage(P5에서 서버 전환 예정).
// 탭 컴포넌트는 이 훅의 API만 본다.
import { useEffect, useState } from 'react';
import * as learningApi from '../../api/learningApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/ToastContext';

export const CATEGORY_MAP = {
  programming: '프로그래밍',
  design: '디자인',
  language: '언어',
  business: '비즈니스',
  other: '기타',
} as const;

export type CategoryKey = keyof typeof CATEGORY_MAP;

export type GoalFormType = {
  title: string;
  category: string;
  deadline: string;
  description: string;
  dailyStudyTime: number;
};

export type ScheduleFormType = {
  goalId: string;
  date: string;
  time: string;
  content: string;
  duration: number;
};

export type Goal = {
  id: number;
  title: string;
  category: CategoryKey;
  deadline: string;
  description: string;
  dailyStudyTime: number;
  linkedLevel?: string | null;
  progress: number;
  progressDetail?: learningApi.GoalProgressDetail;
  createdAt: string;
};

export type Schedule = {
  id: number;
  goalId: number;
  date: string;
  time: string;
  content: string;
  duration: number;
  completed: boolean;
  createdAt: string;
};

function readStored<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

const toGoalPayload = (form: GoalFormType): learningApi.GoalPayload => ({
  title: form.title,
  category: form.category,
  deadline: form.deadline,
  description: form.description,
  daily_study_time: Number(form.dailyStudyTime),
});

export function useLearningData() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>(
    () => readStored<Schedule>('schedules'),
  );

  // 목표는 서버에서 로드 (로그인 사용자 기준)
  useEffect(() => {
    if (!user) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }
    let cancelled = false;
    setGoalsLoading(true);
    learningApi.fetchGoals()
      .then((loaded) => { if (!cancelled) setGoals(loaded as Goal[]); })
      .catch(() => { if (!cancelled) showToast('목표를 불러오지 못했습니다.', 'error'); })
      .finally(() => { if (!cancelled) setGoalsLoading(false); });
    return () => { cancelled = true; };
  }, [user, showToast]);

  // 일정은 아직 localStorage (P5에서 서버 전환)
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const addGoal = async (form: GoalFormType): Promise<boolean> => {
    try {
      const created = await learningApi.createGoal(toGoalPayload(form));
      setGoals((goals) => [created as Goal, ...goals]);
      return true;
    } catch {
      showToast('목표 저장에 실패했습니다.', 'error');
      return false;
    }
  };

  const updateGoal = async (goalId: number, form: GoalFormType): Promise<boolean> => {
    try {
      const updated = await learningApi.updateGoal(goalId, toGoalPayload(form));
      setGoals((goals) => goals.map((g) => g.id === goalId ? (updated as Goal) : g));
      return true;
    } catch {
      showToast('목표 수정에 실패했습니다.', 'error');
      return false;
    }
  };

  const deleteGoal = async (goalId: number): Promise<boolean> => {
    try {
      await learningApi.deleteGoal(goalId);
      setGoals((goals) => goals.filter((g) => g.id !== goalId));
      return true;
    } catch {
      showToast('목표 삭제에 실패했습니다.', 'error');
      return false;
    }
  };

  const addSchedule = (form: ScheduleFormType) => {
    setSchedules((schedules) => [
      ...schedules,
      {
        id: Date.now(),
        goalId: Number(form.goalId),
        date: form.date,
        time: form.time,
        content: form.content,
        duration: Number(form.duration),
        completed: false,
        createdAt: new Date().toISOString(),
      } as Schedule,
    ]);
  };

  const toggleScheduleComplete = (scheduleId: number) => {
    setSchedules((schedules) => schedules.map((s) =>
      s.id === scheduleId ? { ...s, completed: !s.completed } : s));
    // 과도기(P4) 화면 반영용 — P5에서 서버 진도율 갱신으로 교체
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule && !schedule.completed) {
      setGoals((goals) => goals.map((g) => g.id === schedule.goalId
        ? { ...g, progress: Math.min(100, (g.progress || 0) + Math.min(5, (schedule.duration / 60) * 2)) }
        : g));
    }
  };

  return {
    goals, goalsLoading, schedules,
    addGoal, updateGoal, deleteGoal,
    addSchedule, toggleScheduleComplete,
  };
}

export type LearningData = ReturnType<typeof useLearningData>;
