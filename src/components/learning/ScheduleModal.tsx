// 일정 추가 모달 (LearningManagerPage에서 분리)
import React, { useRef, useState } from 'react';
import { getTodayStr } from './dateUtils';
import { type Goal, type ScheduleFormType } from './useLearningData';

type Props = {
  open: boolean;
  goals: Goal[];
  onClose: () => void;
  onSubmit: (form: ScheduleFormType) => void;
};

const EMPTY_FORM: ScheduleFormType = {
  goalId: '',
  date: getTodayStr(),
  time: '',
  content: '',
  duration: 60,
};

export default function ScheduleModal({ open, goals, onClose, onSubmit }: Props) {
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormType>({ ...EMPTY_FORM, date: getTodayStr() });
  const scheduleFormRef = useRef<HTMLFormElement>(null);

  if (!open) return null;

  const handleClose = () => {
    setScheduleForm({ ...EMPTY_FORM, date: getTodayStr() });
    scheduleFormRef.current?.reset();
    onClose();
  };

  const handleScheduleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setScheduleForm({
      ...scheduleForm,
      [id]: type === 'number' ? Number(value) : value,
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(scheduleForm);
    handleClose();
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3>학습 일정 추가</h3>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>
        <form id="scheduleForm" ref={scheduleFormRef} onSubmit={handleScheduleSubmit}>
          <div className="form-group">
            <label htmlFor="goalId">연결된 목표</label>
            <select id="goalId" value={scheduleForm.goalId ?? ''} onChange={handleScheduleFormChange} required>
              <option value="">목표를 선택하세요</option>
              {goals.map((goal) => (
                <option value={goal.id} key={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">날짜</label>
              <input type="date" id="date" value={scheduleForm.date ?? getTodayStr()} min={getTodayStr()} onChange={handleScheduleFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="time">시간</label>
              <input type="time" id="time" value={scheduleForm.time ?? ''} onChange={handleScheduleFormChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="content">학습 내용</label>
            <input type="text" id="content" value={scheduleForm.content ?? ''} onChange={handleScheduleFormChange} placeholder="예: React Hooks 학습" required />
          </div>
          <div className="form-group">
            <label htmlFor="duration">예상 소요 시간 (분)</label>
            <input type="number" id="duration" min={15} max={300} value={scheduleForm.duration ?? 60} onChange={handleScheduleFormChange} required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={handleClose}>취소</button>
            <button type="submit" className="btn btn-primary">일정 추가</button>
          </div>
        </form>
      </div>
    </div>
  );
}
