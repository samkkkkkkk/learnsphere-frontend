// 일정관리 탭 — 주간 캘린더 + 일정 추가/수정/삭제
import React, { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';
import { getStartOfWeek, getWeekNumber, isToday, toLocalDateStr } from './dateUtils';
import MonthCalendar from './MonthCalendar';
import ScheduleModal from './ScheduleModal';
import { type Goal, type Schedule, type ScheduleFormType } from './useLearningData';

type Props = {
  goals: Goal[];
  schedules: Schedule[];
  addSchedule: (form: ScheduleFormType) => Promise<boolean>;
  updateScheduleItem: (scheduleId: number, form: ScheduleFormType) => Promise<boolean>;
  deleteScheduleItem: (scheduleId: number) => Promise<boolean>;
  toggleScheduleComplete: (scheduleId: number) => Promise<void>;
};

export default function ScheduleTab({
  goals, schedules, addSchedule, updateScheduleItem, deleteScheduleItem,
  toggleScheduleComplete,
}: Props) {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<null | number>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [calendarWeek, setCalendarWeek] = useState(new Date());

  function getSchedulesForDate(date: Date) {
    const dateString = toLocalDateStr(date);
    return schedules.filter((s) => s.date === dateString);
  }

  const handleModalSubmit = (form: ScheduleFormType) => {
    if (editingSchedule) {
      void updateScheduleItem(editingSchedule.id, form);
    } else {
      void addSchedule(form);
    }
  };

  const handleModalClose = () => {
    setScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  const openEdit = (e: React.MouseEvent, schedule: Schedule) => {
    e.stopPropagation();
    setEditingSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const openDelete = (e: React.MouseEvent, scheduleId: number) => {
    e.stopPropagation();
    setDeletingScheduleId(scheduleId);
  };

  const confirmDelete = () => {
    if (deletingScheduleId !== null) {
      void deleteScheduleItem(deletingScheduleId);
    }
    setDeletingScheduleId(null);
  };

  return (
    <section id="schedule" className="section active">
      <div className="section-header">
        <h2><i className="fas fa-calendar-alt"></i> 학습 일정 관리</h2>
        <p>체계적인 일정으로 꾸준한 학습 습관을 만들어보세요</p>
      </div>
      <div className="schedule-controls">
        <button id="addScheduleBtn" className="btn btn-primary" onClick={() => setScheduleModalOpen(true)}>
          <i className="fas fa-plus"></i> 일정 추가
        </button>
        <div className="view-controls">
          <button className={`btn btn-outline${viewMode === 'week' ? ' active' : ''}`} onClick={() => setViewMode('week')}>주간</button>
          <button className={`btn btn-outline${viewMode === 'month' ? ' active' : ''}`} onClick={() => setViewMode('month')}>월간</button>
        </div>
      </div>
      <div className="calendar-container">
        <div className="calendar-header">
          <button id="prevWeek" className="btn btn-icon" aria-label={viewMode === 'week' ? '이전 주' : '이전 달'} onClick={() => {
            const next = new Date(calendarWeek);
            if (viewMode === 'week') next.setDate(next.getDate() - 7);
            else next.setMonth(next.getMonth() - 1);
            setCalendarWeek(next);
          }}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h3 id="currentWeek">
            {viewMode === 'week'
              ? `${calendarWeek.getFullYear()}년 ${calendarWeek.getMonth() + 1}월 ${getWeekNumber(calendarWeek)}주차`
              : `${calendarWeek.getFullYear()}년 ${calendarWeek.getMonth() + 1}월`}
          </h3>
          <button id="nextWeek" className="btn btn-icon" aria-label={viewMode === 'week' ? '다음 주' : '다음 달'} onClick={() => {
            const next = new Date(calendarWeek);
            if (viewMode === 'week') next.setDate(next.getDate() + 7);
            else next.setMonth(next.getMonth() + 1);
            setCalendarWeek(next);
          }}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        {viewMode === 'week' ? (
          <div className="calendar-grid" id="calendarGrid">
            {Array.from({length: 7}).map((_, i) => {
              const startOfWeek = getStartOfWeek(calendarWeek);
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + i);
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              const daySchedules = getSchedulesForDate(date);
              return (
                <div className={`calendar-day${isToday(date) ? ' today' : ''}`} key={i}>
                  <div className="day-header">{dayNames[i]} {date.getDate()}</div>
                  <div className="day-events">
                    {daySchedules.map((s) => (
                      <div className={`event-item${s.completed ? ' completed' : ''}`} key={s.id} title={s.completed ? '클릭하면 완료를 해제합니다' : '클릭하면 완료로 표시합니다'} onClick={() => void toggleScheduleComplete(s.id)}>
                        <span className="event-label">{s.time} {s.content}</span>
                        <span className="event-actions">
                          <button className="event-action-btn" aria-label="일정 수정" onClick={(e) => openEdit(e, s)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="event-action-btn" aria-label="일정 삭제" onClick={(e) => openDelete(e, s.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <MonthCalendar
            monthDate={calendarWeek}
            schedules={schedules}
            onToggleComplete={(id) => void toggleScheduleComplete(id)}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        )}
      </div>
      <ScheduleModal
        open={scheduleModalOpen}
        goals={goals}
        editing={editingSchedule}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
      <ConfirmModal
        open={deletingScheduleId !== null}
        title="일정 삭제"
        message="이 일정을 삭제하면 되돌릴 수 없습니다. 삭제할까요?"
        confirmLabel="삭제"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingScheduleId(null)}
      />
    </section>
  );
}
