import { useCallback, useEffect, useState } from 'react';
import * as learningApi from '../api/learningApi';
import type { Quiz as QuizItem } from '../api/lessonApi';
import { getAuthToken } from '../api/axios';
import {
  lessonIdOf, QUIZ_PROGRESS_EVENT, storageKeyOf,
  type Grade, type StoredResult,
} from './quizProgress';
import './Quiz.css';

/**
 * 로그인 상태면 퀴즈 진도를 서버에도 남긴다 (fire-and-forget).
 * 실패해도 UX를 막지 않는다 — localStorage가 오프라인 캐시로 남는다.
 */
function syncToServer(key: string, grades: (Grade | null)[]) {
  const lessonId = lessonIdOf(key);
  if (lessonId === null || !getAuthToken()) return;
  const done = grades.filter(Boolean).length;
  void learningApi.upsertLessonProgress(lessonId, {
    done,
    correct: grades.filter(grade => grade === 'correct').length,
    total: grades.length,
    completed: done === grades.length && grades.length > 0,
  }).catch(() => {});
}

interface QuizProps {
  quizzes: QuizItem[];
  /** 저장 키 — 레슨 id 기반으로 지정 (예: `lesson-12`) */
  storageKey: string;
}

/**
 * 자가 채점 퀴즈 세트.
 *
 * 흐름: 답 생각하기 → [정답 확인] → 정답·해설 공개 → [맞았어요/틀렸어요] 자가 표시
 * → 전부 채점하면 정답률 요약 + 다시 풀기. 결과는 localStorage에 저장되어
 * 새로고침 후에도 유지되고, 레슨 목록의 완료 뱃지와 연동된다.
 */
export default function Quiz({ quizzes, storageKey }: QuizProps) {
  const loadGrades = useCallback((): (Grade | null)[] => {
    try {
      const raw = localStorage.getItem(storageKeyOf(storageKey));
      if (raw) {
        const parsed = JSON.parse(raw) as StoredResult;
        if (Array.isArray(parsed.grades) && parsed.grades.length === quizzes.length) {
          return parsed.grades;
        }
      }
    } catch {
      // 저장 데이터가 깨졌으면 새로 시작
    }
    return quizzes.map(() => null);
  }, [storageKey, quizzes]);

  const [grades, setGrades] = useState<(Grade | null)[]>(loadGrades);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // 레슨(storageKey)이 바뀌면 해당 레슨의 저장 상태로 초기화
  useEffect(() => {
    setGrades(loadGrades());
    setRevealed(new Set());
  }, [loadGrades]);

  // 같은 레슨을 그리는 다른 인스턴스(크게보기 모달 등)와 동기화
  useEffect(() => {
    const sync = () => setGrades(loadGrades());
    window.addEventListener(QUIZ_PROGRESS_EVENT, sync);
    return () => window.removeEventListener(QUIZ_PROGRESS_EVENT, sync);
  }, [loadGrades]);

  const persist = (next: (Grade | null)[]) => {
    const completed = next.every(Boolean) && next.length > 0;
    const payload: StoredResult = {
      grades: next,
      ...(completed ? { completedAt: new Date().toISOString() } : {}),
    };
    localStorage.setItem(storageKeyOf(storageKey), JSON.stringify(payload));
    syncToServer(storageKey, next);
    window.dispatchEvent(new CustomEvent(QUIZ_PROGRESS_EVENT, { detail: { key: storageKey } }));
  };

  const reveal = (index: number) => {
    setRevealed(prev => new Set(prev).add(index));
  };

  const grade = (index: number, value: Grade) => {
    const next = [...grades];
    next[index] = value;
    setGrades(next);
    persist(next);
  };

  const retake = () => {
    const next: (Grade | null)[] = quizzes.map(() => null);
    setGrades(next);
    setRevealed(new Set());
    localStorage.removeItem(storageKeyOf(storageKey));
    syncToServer(storageKey, next);
    window.dispatchEvent(new CustomEvent(QUIZ_PROGRESS_EVENT, { detail: { key: storageKey } }));
  };

  if (quizzes.length === 0) return null;

  const doneCount = grades.filter(Boolean).length;
  const correctCount = grades.filter(g => g === 'correct').length;
  const allDone = doneCount === quizzes.length;

  return (
    <div className="quiz-set">
      <div className="quiz-progress" aria-live="polite">
        {doneCount}/{quizzes.length} 문제 완료
      </div>

      {quizzes.map((quiz, index) => {
        const isRevealed = revealed.has(index) || grades[index] !== null;
        return (
          <div key={index} className="quiz-item">
            <div className="quiz-question">
              <span className="quiz-number">{index + 1}.</span>
              <span className="quiz-text">{quiz.question}</span>
              {!isRevealed && (
                <button
                  type="button"
                  className="quiz-toggle-btn"
                  onClick={() => reveal(index)}
                >
                  정답 확인
                </button>
              )}
              {grades[index] === 'correct' && (
                <span className="quiz-grade quiz-grade--correct">✓ 맞았어요</span>
              )}
              {grades[index] === 'wrong' && (
                <span className="quiz-grade quiz-grade--wrong">✕ 틀렸어요</span>
              )}
            </div>

            {isRevealed && (
              <div className="quiz-answer">
                <strong>정답:</strong> {quiz.answer}
                {quiz.explanation && (
                  <div className="quiz-explanation">
                    <strong>해설:</strong> {quiz.explanation}
                  </div>
                )}
                {grades[index] === null && (
                  <div className="quiz-self-grade">
                    <span className="quiz-self-grade__hint">생각한 답과 비교해보세요 —</span>
                    <button
                      type="button"
                      className="quiz-grade-btn quiz-grade-btn--ok"
                      onClick={() => grade(index, 'correct')}
                    >
                      ✓ 맞았어요
                    </button>
                    <button
                      type="button"
                      className="quiz-grade-btn quiz-grade-btn--no"
                      onClick={() => grade(index, 'wrong')}
                    >
                      ✕ 틀렸어요
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {allDone && (
        <div className="quiz-summary" role="status">
          <span>
            이번 세트 정답률 <strong>{correctCount}/{quizzes.length}</strong>
            {correctCount === quizzes.length
              ? ' 🎉 완벽해요!'
              : ' — 틀린 문제는 해설을 다시 읽어보세요.'}
          </span>
          <button type="button" className="quiz-retake" onClick={retake}>
            다시 풀기
          </button>
        </div>
      )}
    </div>
  );
}
