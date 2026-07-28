// 일정관리 탭 — 주간 캘린더 + 일정 추가 (LearningManagerPage에서 분리)
import { useState } from 'react';
import { getStartOfWeek, getWeekNumber, isToday, toLocalDateStr } from './dateUtils';
import ScheduleModal from './ScheduleModal';
import { type Goal, type Schedule, type ScheduleFormType } from './useLearningData';

type Props = {
  goals: Goal[];
  schedules: Schedule[];
  addSchedule: (form: ScheduleFormType) => void;
  toggleScheduleComplete: (scheduleId: number) => void;
};

export default function ScheduleTab({ goals, schedules, addSchedule, toggleScheduleComplete }: Props) {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [calendarWeek, setCalendarWeek] = useState(new Date());

  function getSchedulesForDate(date: Date) {
    const dateString = toLocalDateStr(date);
    return schedules.filter((s) => s.date === dateString);
  }

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
          <button className="btn btn-outline active">주간</button>
          <button className="btn btn-outline">월간</button>
        </div>
      </div>
      <div className="calendar-container">
        <div className="calendar-header">
          <button id="prevWeek" className="btn btn-icon" onClick={() => setCalendarWeek(new Date(calendarWeek.setDate(calendarWeek.getDate() - 7)))}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h3 id="currentWeek">{calendarWeek.getFullYear()}년 {calendarWeek.getMonth() + 1}월 {getWeekNumber(calendarWeek)}주차</h3>
          <button id="nextWeek" className="btn btn-icon" onClick={() => setCalendarWeek(new Date(calendarWeek.setDate(calendarWeek.getDate() + 7)))}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
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
                    <div className={`event-item${s.completed ? ' completed' : ''}`} key={s.id} onClick={() => toggleScheduleComplete(s.id)}>
                      {s.time} {s.content}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ScheduleModal
        open={scheduleModalOpen}
        goals={goals}
        onClose={() => setScheduleModalOpen(false)}
        onSubmit={addSchedule}
      />
    </section>
  );
}
