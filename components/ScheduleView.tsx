
import React from 'react';
// Fix: Removed missing parseISO, using native new Date() constructor
import { format, isPast, isToday } from 'date-fns';
import { CalendarEvent } from '../types';
import { CATEGORIES } from '../constants';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface ScheduleViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ events, onEventClick }) => {
  // Fix: Sorting using native Date instead of missing parseISO
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white lg:rounded-3xl border border-gray-100 shadow-inner p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-20">
            <CalendarIcon size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No events scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const eventDate = new Date(event.date);
              return (
                <div 
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`group relative flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer bg-white ${isPast(eventDate) && !isToday(eventDate) ? 'opacity-60' : ''}`}
                >
                  <div className={`w-1.5 h-12 rounded-full ${CATEGORIES[event.category].bg.replace('bg-', 'bg-')}`} style={{backgroundColor: 'currentColor'}} />
                  
                  <div className="flex flex-col min-w-[100px]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {format(eventDate, 'MMM d')}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {format(eventDate, 'eeee')}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${CATEGORIES[event.category].bg} ${CATEGORIES[event.category].color}`}>
                        {event.category}
                      </span>
                      {event.amount && (
                        <span className={`flex items-center text-[10px] font-bold ${event.transactionType === 'income' ? 'text-green-600' : 'text-rose-600'}`}>
                          <span className="mr-0.5">₱</span>
                          {event.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Clock size={14} />
                      {event.startTime || 'All Day'}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">By {event.createdBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
