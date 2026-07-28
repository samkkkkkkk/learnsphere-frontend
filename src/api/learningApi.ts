// 학습 매니저 API — 목표/일정. 서버 응답(snake_case)을 프론트 타입(camelCase)으로 매핑한다.
import api from './axios';

export interface GoalProgressDetail {
  scheduleDone: number;
  scheduleTotal: number;
  lessonDone: number;
  lessonTotal: number;
}

export interface ServerGoal {
  id: number;
  title: string;
  category: string;
  description: string | null;
  deadline: string;
  daily_study_time: number;
  linked_level: string | null;
  progress: number;
  progress_detail: {
    schedule_done: number;
    schedule_total: number;
    lesson_done: number;
    lesson_total: number;
  };
  created_at?: string;
}

export interface GoalPayload {
  title: string;
  category: string;
  deadline: string;
  description: string;
  daily_study_time: number;
  linked_level?: string | null;
}

// 프론트 UI가 쓰는 형태 (useLearningData의 Goal과 호환)
export interface MappedGoal {
  id: number;
  title: string;
  category: string;
  deadline: string;
  description: string;
  dailyStudyTime: number;
  linkedLevel: string | null;
  progress: number;
  progressDetail: GoalProgressDetail;
  createdAt: string;
}

const mapGoal = (g: ServerGoal): MappedGoal => ({
  id: g.id,
  title: g.title,
  category: g.category,
  deadline: g.deadline,
  description: g.description ?? '',
  dailyStudyTime: g.daily_study_time,
  linkedLevel: g.linked_level,
  progress: g.progress,
  progressDetail: {
    scheduleDone: g.progress_detail.schedule_done,
    scheduleTotal: g.progress_detail.schedule_total,
    lessonDone: g.progress_detail.lesson_done,
    lessonTotal: g.progress_detail.lesson_total,
  },
  createdAt: g.created_at ?? '',
});

// --- 목표 ---

export const fetchGoals = async (): Promise<MappedGoal[]> => {
  const response = await api.get<ServerGoal[]>('/api/v1/learning/goals');
  return response.data.map(mapGoal);
};

export const createGoal = async (payload: GoalPayload): Promise<MappedGoal> => {
  const response = await api.post<ServerGoal>('/api/v1/learning/goals', payload);
  return mapGoal(response.data);
};

export const updateGoal = async (
  goalId: number,
  payload: Partial<GoalPayload>,
): Promise<MappedGoal> => {
  const response = await api.patch<ServerGoal>(
    `/api/v1/learning/goals/${goalId}`, payload);
  return mapGoal(response.data);
};

export const deleteGoal = async (goalId: number): Promise<void> => {
  await api.delete(`/api/v1/learning/goals/${goalId}`);
};
