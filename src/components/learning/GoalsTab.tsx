// 목표설정 탭 — 목표 폼 + 목록 (LearningManagerPage에서 분리)
import React, { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';
import { getTodayStr } from './dateUtils';
import { CATEGORY_MAP, type Goal, type GoalFormType } from './useLearningData';

type Props = {
  goals: Goal[];
  addGoal: (form: GoalFormType) => Promise<boolean>;
  updateGoal: (goalId: number, form: GoalFormType) => Promise<boolean>;
  deleteGoal: (goalId: number) => Promise<boolean>;
};

const EMPTY_FORM: GoalFormType = {
  title: '',
  category: '',
  deadline: getTodayStr(),
  description: '',
  dailyStudyTime: 60,
  linkedLevel: '',
};

export default function GoalsTab({ goals, addGoal, updateGoal, deleteGoal }: Props) {
  const [goalForm, setGoalForm] = useState<GoalFormType>({ ...EMPTY_FORM, deadline: getTodayStr() });
  const [editingGoalId, setEditingGoalId] = useState<null | number>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<null | number>(null);
  const [goalMessage, setGoalMessage] = useState<{text: string, type: string} | null>(null);

  const handleGoalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setGoalForm({
      ...goalForm,
      [id]: type === 'number' ? Number(value) : value,
    });
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.category || !goalForm.deadline) return;
    if (editingGoalId) {
      if (!(await updateGoal(editingGoalId, goalForm))) return;
      setGoalMessage({ text: '목표가 수정되었습니다!', type: 'success' });
      setEditingGoalId(null);
    } else {
      if (!(await addGoal(goalForm))) return;
      setGoalMessage({ text: '목표가 성공적으로 추가되었습니다!', type: 'success' });
    }
    setGoalForm({ ...EMPTY_FORM, deadline: getTodayStr() });
  };

  const handleGoalEdit = (goal: Goal) => {
    setGoalForm({
      title: goal.title,
      category: goal.category,
      deadline: goal.deadline,
      description: goal.description,
      dailyStudyTime: goal.dailyStudyTime,
      linkedLevel: goal.linkedLevel ?? '',
    });
    setEditingGoalId(goal.id);
  };

  const confirmGoalDelete = () => {
    if (deletingGoalId !== null) {
      void deleteGoal(deletingGoalId);
    }
    setDeletingGoalId(null);
  };

  return (
    <section id="goals" className="section active">
      <div className="section-header">
        <h2><i className="fas fa-target"></i> 학습 목표 설정</h2>
        <p>명확한 목표를 설정하여 효율적인 학습을 시작하세요</p>
      </div>
      <div className="goal-form-container">
        <form id="goalForm" className="goal-form" onSubmit={handleGoalSubmit}>
          <div className="form-group">
            <label htmlFor="title">학습 목표</label>
            <input type="text" id="title" value={goalForm.title ?? ''} onChange={handleGoalFormChange} placeholder="예: React 마스터하기" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">카테고리</label>
              <select id="category" value={goalForm.category ?? ''} onChange={handleGoalFormChange} required>
                <option value="">선택하세요</option>
                <option value="programming">프로그래밍</option>
                <option value="design">디자인</option>
                <option value="language">언어</option>
                <option value="business">비즈니스</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="deadline">목표 완료일</label>
              <input type="date" id="deadline" value={goalForm.deadline ?? getTodayStr()} min={getTodayStr()} onChange={handleGoalFormChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">상세 설명</label>
            <textarea id="description" value={goalForm.description ?? ''} onChange={handleGoalFormChange} placeholder="목표에 대한 구체적인 설명을 입력하세요" rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dailyStudyTime">일일 학습 시간 (분)</label>
              <input type="number" id="dailyStudyTime" min={15} max={480} value={goalForm.dailyStudyTime ?? 60} onChange={handleGoalFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="linkedLevel">레슨 레벨 연결 (선택)</label>
              <select id="linkedLevel" value={goalForm.linkedLevel ?? ''} onChange={handleGoalFormChange}>
                <option value="">연결 안 함</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-plus"></i> {editingGoalId ? '목표 수정' : '목표 추가'}
          </button>
        </form>
        {goalMessage && (
          <div className={`message ${goalMessage.type} show`} style={{marginTop: 12}}>{goalMessage.text}</div>
        )}
      </div>
      <div className="goals-list" id="goalsList">
        {goals.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-target"></i>
            <p>아직 설정된 목표가 없습니다. 첫 번째 목표를 추가해보세요!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div className="goal-item" key={goal.id}>
              <div className="goal-header">
                <h3 className="goal-title">{goal.title}</h3>
                <span className="goal-category">{CATEGORY_MAP[goal.category] || goal.category}</span>
              </div>
              <p className="goal-description">{goal.description}</p>
              <div className="goal-progress">
                <div className="goal-progress-fill" style={{width: `${goal.progress || 0}%`}}></div>
              </div>
              <div className="goal-meta">
                <span><i className="fas fa-calendar"></i> {goal.deadline}</span>
                <span><i className="fas fa-clock"></i> {goal.dailyStudyTime}분/일</span>
                {goal.linkedLevel && (
                  <span><i className="fas fa-book"></i> {goal.linkedLevel} 레슨 연동</span>
                )}
                <span className="progress-text">{goal.progress || 0}% 완료</span>
              </div>
              {goal.progressDetail && (goal.progressDetail.scheduleTotal > 0 || goal.progressDetail.lessonTotal > 0) && (
                <div className="goal-progress-breakdown">
                  일정 {goal.progressDetail.scheduleDone}/{goal.progressDetail.scheduleTotal}
                  {goal.progressDetail.lessonTotal > 0 && (
                    <> · 레슨 {goal.progressDetail.lessonDone}/{goal.progressDetail.lessonTotal}</>
                  )}
                </div>
              )}
              <div className="goal-actions">
                <button className="edit-btn" onClick={() => handleGoalEdit(goal)}><i className="fas fa-edit"></i></button>
                <button className="delete-btn" onClick={() => setDeletingGoalId(goal.id)}><i className="fas fa-trash"></i></button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={deletingGoalId !== null}
        title="목표 삭제"
        message="이 목표를 삭제하면 되돌릴 수 없습니다. 삭제할까요?"
        confirmLabel="삭제"
        danger
        onConfirm={confirmGoalDelete}
        onCancel={() => setDeletingGoalId(null)}
      />
    </section>
  );
}
