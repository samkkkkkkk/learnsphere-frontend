// 학습 매니저 데이터 훅 (P3: localStorage 구현).
// P4~P5에서 내부만 서버 호출로 교체한다 — 탭 컴포넌트는 이 훅의 API만 본다.
import { useEffect, useState } from 'react';

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
  progress: number;
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

export function useLearningData() {
  const [goals, setGoals] = useState<Goal[]>(() => readStored<Goal>('goals'));
  const [schedules, setSchedules] = useState<Schedule[]>(
    () => readStored<Schedule>('schedules'),
  );

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const addGoal = (form: GoalFormType) => {
    setGoals((goals) => [
      ...goals,
      {
        id: Date.now(),
        title: form.title,
        category: form.category as CategoryKey,
        deadline: form.deadline,
        description: form.description,
        dailyStudyTime: Number(form.dailyStudyTime),
        progress: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateGoal = (goalId: number, form: GoalFormType) => {
    setGoals((goals) => goals.map((g) => g.id === goalId ? {
      ...g,
      ...form,
      category: form.category as CategoryKey,
      dailyStudyTime: Number(form.dailyStudyTime),
    } : g));
  };

  const deleteGoal = (goalId: number) => {
    setGoals((goals) => goals.filter((g) => g.id !== goalId));
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
    // 진도 업데이트
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule && !schedule.completed) {
      setGoals((goals) => goals.map((g) => g.id === schedule.goalId
        ? { ...g, progress: Math.min(100, (g.progress || 0) + Math.min(5, (schedule.duration / 60) * 2)) }
        : g));
    }
  };

  return {
    goals, schedules,
    addGoal, updateGoal, deleteGoal,
    addSchedule, toggleScheduleComplete,
  };
}

export type LearningData = ReturnType<typeof useLearningData>;
