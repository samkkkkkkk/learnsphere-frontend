// 월간 캘린더 — 날짜별 일정 개수를 도트로 표시하고, 날짜를 고르면 그날 일정을 보여준다.
import React, { useState } from 'react';
import { isToday, toLocalDateStr } from './dateUtils';
import { type Schedule } from './useLearningData';

type Props = {
  monthDate: Date;
  schedules: Schedule[];
  onToggleComplete: (scheduleId: number) => void;
  onEdit: (e: React.MouseEvent, schedule: Schedule) => void;
  onDelete: (e: React.MouseEvent, scheduleId: number) => void;
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function MonthCalendar({
  monthDate, schedules, onToggleComplete, onEdit, onDelete,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 첫 주 앞쪽 빈 칸(전월) 포함 6주 그리드
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDay.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = new Map<string, Schedule[]>();
  schedules.forEach((s) => {
    byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]);
  });

  const selectedSchedules = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return (
    <>
      <div className="month-grid" role="grid">
        {DAY_NAMES.map((name) => (
          <div className="month-day-name" key={name}>{name}</div>
        ))}
        {cells.map((date, i) => {
          if (date === null) {
            return <div className="month-day month-day--empty" key={i} />;
          }
          const dateStr = toLocalDateStr(date);
          const daySchedules = byDate.get(dateStr) ?? [];
          const doneCount = daySchedules.filter((s) => s.completed).length;
          const classes = [
            'month-day',
            isToday(date) ? 'today' : '',
            selectedDate === dateStr ? 'selected' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              type="button"
              className={classes}
              key={i}
              onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
            >
              <span className="month-day-number">{date.getDate()}</span>
              {daySchedules.length > 0 && (
                <span
                  className={`month-day-count${doneCount === daySchedules.length ? ' all-done' : ''}`}
                  title={`일정 ${daySchedules.length}개 (완료 ${doneCount})`}
                >
                  {daySchedules.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <div className="month-day-detail">
          <h4>{selectedDate} 일정</h4>
          {selectedSchedules.length === 0 ? (
            <p className="month-day-detail__empty">이 날에는 일정이 없습니다.</p>
          ) : (
            <div className="day-events">
              {selectedSchedules.map((s) => (
                <div
                  className={`event-item${s.completed ? ' completed' : ''}`}
                  key={s.id}
                  onClick={() => onToggleComplete(s.id)}
                >
                  <span className="event-label">{s.time} {s.content}</span>
                  <span className="event-actions">
                    <button className="event-action-btn" aria-label="일정 수정" onClick={(e) => onEdit(e, s)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="event-action-btn" aria-label="일정 삭제" onClick={(e) => onDelete(e, s.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
