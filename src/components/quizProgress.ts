// 퀴즈 진도 저장/조회 헬퍼 — Quiz 컴포넌트와 레슨 목록 뱃지가 공유한다.
// (Quiz.tsx에서 분리: 컴포넌트 파일은 컴포넌트만 export해야 Fast Refresh가 동작)

export type Grade = 'correct' | 'wrong';

export interface StoredResult {
  grades: (Grade | null)[];
  completedAt?: string;
}

/** 퀴즈 진도 변경 시 발행 — 레슨 목록 뱃지 등이 구독한다 */
export const QUIZ_PROGRESS_EVENT = 'learnsphere:quiz-updated';

export const storageKeyOf = (key: string) => `learnsphere.quiz.${key}`;

/** storageKey(`lesson-12`)에서 레슨 id를 꺼낸다. 형식이 다르면 null. */
export function lessonIdOf(key: string): number | null {
  const match = /^lesson-(\d+)$/.exec(key);
  return match ? Number(match[1]) : null;
}

/** 저장된 퀴즈 진도 조회 (레슨 목록 완료 뱃지용) */
export function getQuizProgress(key: string): { done: number; correct: number; total: number; completed: boolean } | null {
  try {
    const raw = localStorage.getItem(storageKeyOf(key));
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredResult;
    if (!Array.isArray(data.grades)) return null;
    const done = data.grades.filter(Boolean).length;
    return {
      done,
      correct: data.grades.filter(grade => grade === 'correct').length,
      total: data.grades.length,
      completed: done === data.grades.length && data.grades.length > 0,
    };
  } catch {
    return null;
  }
}
