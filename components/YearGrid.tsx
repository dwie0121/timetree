
import React from 'react';
import { 
  format, 
  eachMonthOfInterval, 
  endOfYear, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay,
  isToday,
  isSameMonth
} from 'date-fns';
import { CalendarEvent } from '../types';

interface YearGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onMonthClick: (month: Date) => void;
}

const YearGrid: React.FC<YearGridProps> = ({ currentDate, events, onMonthClick }) => {
  // Fix: Use native Date logic for startOfYear as member is missing from date-fns
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);
  const yearEnd = endOfYear(yearStart);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  return (
    <div className="flex-1 overflow-y-auto p-2 lg:p-4 bg-white lg:rounded-3xl border border-gray-100 shadow-inner">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
        {months.map((month) => (
          <div 
            key={month.toString()} 
            onClick={() => onMonthClick(month)}
            className="flex flex-col gap-3 group cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-all"
          >
            <h3 className="text-sm font-bold text-gray-800 px-1 group-hover:text-blue-600 transition-colors">
              {format(month, 'MMMM')}
            </h3>
            <div className="grid grid-cols-7 gap-y-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[9px] font-bold text-gray-300 text-center">
                  {d}
                </div>
              ))}
              {renderMiniMonth(month, events)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderMiniMonth = (month: Date, events: CalendarEvent[]) => {
  // Fix: Use native Date logic for startOfMonth as member is missing from date-fns
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  
  // Fix: Use native Date logic for startOfWeek as member is missing from date-fns
  const startDate = new Date(monthStart);
  startDate.setDate(monthStart.getDate() - monthStart.getDay());
  
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => {
    const isCurrentMonth = isSameMonth(day, monthStart);
    const hasEvent = events.some(e => isSameDay(new Date(e.date), day));
    const isDayToday = isToday(day);

    return (
      <div 
        key={day.toString()} 
        className="aspect-square flex flex-col items-center justify-center relative"
      >
        <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full transition-all ${
          !isCurrentMonth ? 'text-transparent pointer-events-none' : 
          isDayToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-600'
        }`}>
          {format(day, 'd')}
        </span>
        {hasEvent && isCurrentMonth && !isDayToday && (
          <div className="absolute bottom-0.5 w-1 h-1 bg-blue-400 rounded-full"></div>
        )}
      </div>
    );
  });
};

export default YearGrid;
