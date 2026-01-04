
import React from 'react';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday
} from 'date-fns';
import { CalendarEvent } from '../types';
import { CATEGORIES } from '../constants';

interface CalendarGridProps {
  currentMonth: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonth, events, onDateClick, onEventClick }) => {
  // Fix: Use native Date logic for startOfMonth as member is missing from date-fns
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  
  // Fix: Use native Date logic for startOfWeek as member is missing from date-fns
  const startDate = new Date(monthStart);
  startDate.setDate(monthStart.getDate() - monthStart.getDay());
  
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
      <div className="calendar-grid bg-slate-50/50 border-b border-slate-100">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-[9px] font-extrabold text-slate-300 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString()} 
              onClick={() => onDateClick(day)}
              className={`min-h-[85px] border-r border-b border-slate-50 p-1.5 flex flex-col group cursor-pointer transition-all hover:bg-indigo-50/30 ${
                !isCurrentMonth ? 'bg-slate-50/40' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1 px-1">
                <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                  isToday(day) 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-50' 
                    : isCurrentMonth ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-300'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 2 && (
                  <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    +{dayEvents.length - 2}
                  </span>
                )}
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`group/event text-[9px] px-2 py-1 rounded-lg truncate font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 border border-transparent shadow-sm ${CATEGORIES[event.category].bg} ${CATEGORIES[event.category].color}`}
                  >
                    <div className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0"></div>
                    <span className="truncate tracking-tight">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
