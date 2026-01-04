
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
    <div className="flex-1 flex flex-col bg-white overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
      <div className="calendar-grid bg-slate-50/50 border-b border-slate-100">
        {weekDays.map((day) => (
          <div key={day} className="py-5 text-center text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString()} 
              onClick={() => onDateClick(day)}
              className={`min-h-[120px] border-r border-b border-slate-50 p-2 flex flex-col group cursor-pointer transition-all hover:bg-indigo-50/20 ${
                !isCurrentMonth ? 'bg-slate-50/20' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2 px-1">
                <span className={`text-xs font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isToday(day) 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' 
                    : isCurrentMonth ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-200'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`group/event text-[10px] px-2.5 py-1.5 rounded-xl truncate font-bold flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-95 border border-transparent shadow-sm ${CATEGORIES[event.category].bg} ${CATEGORIES[event.category].color}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
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
