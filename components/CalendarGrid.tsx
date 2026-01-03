
import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
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
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-inner lg:rounded-3xl border border-gray-100">
      <div className="calendar-grid border-b border-gray-100 bg-gray-50/50">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
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
              className={`min-h-[100px] border-r border-b border-gray-100 p-1 flex flex-col group cursor-pointer hover:bg-gray-50/50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50/30' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1 px-1">
                <span className={`text-xs font-semibold p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-all ${
                  isToday(day) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded-md">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
              <div className="space-y-1 overflow-y-auto overflow-x-hidden max-h-[80px] scrollbar-hide">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`text-[10px] sm:text-[11px] px-2 py-1 rounded-lg truncate font-medium flex items-center gap-1.5 transition-all hover:brightness-95 active:scale-95 border-l-2 shadow-sm ${CATEGORIES[event.category].bg} ${CATEGORIES[event.category].color} border-l-current`}
                  >
                    <span className="shrink-0">{CATEGORIES[event.category].icon}</span>
                    <span className="truncate">{event.title}</span>
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
