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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // 목표·일정을 서버에서 로드 (로그인 사용자 기준).
  // 일정은 개인 데이터라 양이 작아 전체를 한 번에 받고, 주간/월간 필터는
  // 클라이언트에서 한다 (범위 쿼리는 서버가 지원하므로 필요 시 전환 가능).
  useEffect(() => {
    if (!user) {
      setGoals([]);
      setSchedules([]);
      setGoalsLoading(false);
      return;
    }
    let cancelled = false;
    setGoalsLoading(true);
    Promise.all([learningApi.fetchGoals(), learningApi.fetchSchedules()])
      .then(([loadedGoals, loadedSchedules]) => {
        if (cancelled) return;
        setGoals(loadedGoals as Goal[]);
        setSchedules(loadedSchedules);
      })
      .catch(() => { if (!cancelled) showToast('학습 데이터를 불러오지 못했습니다.', 'error'); })
      .finally(() => { if (!cancelled) setGoalsLoading(false); });
    return () => { cancelled = true; };
  }, [user, showToast, reloadKey]);

  // 외부 이벤트(로컬 데이터 이관 등) 후 전체 재로드
  const reload = () => setReloadKey((key) => key + 1);

  // 일정 완료 상태가 바뀌면 목표 진도율(서버 계산)을 다시 읽는다
  const refreshGoals = async () => {
    try {
      setGoals(await learningApi.fetchGoals() as Goal[]);
    } catch {
      // 진도율 갱신 실패는 치명적이지 않다 — 다음 로드에서 맞춰진다
    }
  };

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

  const toSchedulePayload = (form: ScheduleFormType): learningApi.SchedulePayload => ({
    goal_id: Number(form.goalId),
    date: form.date,
    time: form.time,
    content: form.content,
    duration_minutes: Number(form.duration),
  });

  const addSchedule = async (form: ScheduleFormType): Promise<boolean> => {
    try {
      const created = await learningApi.createSchedule(toSchedulePayload(form));
      setSchedules((schedules) => [...schedules, created]);
      await refreshGoals();
      return true;
    } catch {
      showToast('일정 저장에 실패했습니다.', 'error');
      return false;
    }
  };

  const updateScheduleItem = async (scheduleId: number,
                                    form: ScheduleFormType): Promise<boolean> => {
    try {
      const updated = await learningApi.updateSchedule(
        scheduleId, toSchedulePayload(form));
      setSchedules((schedules) => schedules.map((s) =>
        s.id === scheduleId ? updated : s));
      return true;
    } catch {
      showToast('일정 수정에 실패했습니다.', 'error');
      return false;
    }
  };

  const deleteScheduleItem = async (scheduleId: number): Promise<boolean> => {
    try {
      await learningApi.deleteSchedule(scheduleId);
      setSchedules((schedules) => schedules.filter((s) => s.id !== scheduleId));
      await refreshGoals();
      return true;
    } catch {
      showToast('일정 삭제에 실패했습니다.', 'error');
      return false;
    }
  };

  const toggleScheduleComplete = async (scheduleId: number): Promise<void> => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;
    try {
      const updated = await learningApi.updateSchedule(
        scheduleId, { completed: !schedule.completed });
      setSchedules((schedules) => schedules.map((s) =>
        s.id === scheduleId ? updated : s));
      await refreshGoals();
    } catch {
      showToast('일정 상태 변경에 실패했습니다.', 'error');
    }
  };

  return {
    goals, goalsLoading, schedules, reload,
    addGoal, updateGoal, deleteGoal,
    addSchedule, updateScheduleItem, deleteScheduleItem, toggleScheduleComplete,
  };
}

export type LearningData = ReturnType<typeof useLearningData>;
