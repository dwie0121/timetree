
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search, 
  Menu, 
  Calendar as CalendarIcon, 
  Settings,
  Users,
  LayoutDashboard,
  CalendarDays
} from 'lucide-react';
import { format, addMonths, subMonths, addYears, subYears } from 'date-fns';
import CalendarGrid from './components/CalendarGrid';
import YearGrid from './components/YearGrid';
import EventModal from './components/EventModal';
import NotificationPanel from './components/NotificationPanel';
import { CalendarEvent, AppNotification } from './types';
import { MOCK_USERS } from './constants';

type ViewMode = 'month' | 'year';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize Data
  useEffect(() => {
    const savedEvents = localStorage.getItem('synctree_events');
    const savedNotifs = localStorage.getItem('synctree_notifications');
    
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs).map((n: any) => ({ ...n, time: new Date(n.time) })));
    } else {
      const initialEvent: CalendarEvent = {
        id: 'initial-1',
        title: 'Welcome to SyncTree! 👋',
        description: 'Collaborate with your team easily.',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        category: 'Social',
        createdBy: 'Alex Rivera',
        attendees: ['1']
      };
      setEvents([initialEvent]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('synctree_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('synctree_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const pushNotification = (title: string, message: string, type: 'creation' | 'update' | 'reminder') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: new Date(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'attendees'>) => {
    if (editingEvent) {
      const updated = events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e);
      setEvents(updated);
      pushNotification('Event Updated', `${eventData.title} was changed.`, 'update');
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
        createdBy: MOCK_USERS[0].name,
        attendees: [MOCK_USERS[0].id]
      };
      setEvents(prev => [...prev, newEvent]);
      pushNotification('New Event Created', `${MOCK_USERS[0].name} added "${eventData.title}"`, 'creation');
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handlePrev = () => {
    setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subYears(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addYears(currentDate, 1));
  };

  const handleMonthClick = (month: Date) => {
    setCurrentDate(month);
    setViewMode('month');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const remoteEvent: CalendarEvent = {
        id: 'remote-1',
        title: 'Project Kickoff 🚀',
        description: 'New team project start.',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        category: 'Work',
        createdBy: 'Sarah Chen',
        attendees: ['2']
      };
      setEvents(prev => {
        if (prev.find(e => e.id === 'remote-1')) return prev;
        pushNotification('New Shared Event', 'Sarah Chen added Project Kickoff to the calendar.', 'creation');
        return [...prev, remoteEvent];
      });
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen w-full bg-[#f9fafb] text-gray-900 overflow-hidden font-inter">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <CalendarIcon className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">SyncTree</span>
          </div>
          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
            <NavItem icon={<CalendarIcon size={20} />} label="My Schedule" />
            <NavItem icon={<Users size={20} />} label="Team Shared" />
            <NavItem icon={<Settings size={20} />} label="Settings" />
          </nav>
          <div className="mt-auto pt-8 border-t border-gray-50">
            <div className="flex items-center gap-3 px-2">
              <img src={MOCK_USERS[0].avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{MOCK_USERS[0].name}</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 shrink-0 flex items-center justify-between px-4 lg:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : format(currentDate, 'yyyy')}
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500">Shared Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* View Toggle */}
            <div className="hidden md:flex bg-gray-100 rounded-xl p-1 gap-1 mr-2">
              <button 
                onClick={() => setViewMode('month')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewMode('year')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'year' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Year
              </button>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button 
                onClick={handlePrev}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => { setCurrentDate(new Date()); setViewMode('month'); }}
                className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-bold text-gray-600"
              >
                Today
              </button>
              <button 
                onClick={handleNext}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative group"
              >
                <Bell size={22} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel 
                  notifications={notifications} 
                  onClose={() => setShowNotifications(false)}
                  onClear={() => setNotifications([])}
                />
              )}
            </div>

            <button 
              onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline font-bold text-sm">Create</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex -space-x-3 overflow-hidden">
              {MOCK_USERS.map((user) => (
                <img 
                  key={user.id}
                  className="inline-block h-10 w-10 rounded-full ring-4 ring-[#f9fafb] shadow-sm hover:translate-y-[-4px] transition-all cursor-pointer"
                  src={user.avatar}
                  alt={user.name}
                />
              ))}
              <div className="h-10 w-10 rounded-full ring-4 ring-[#f9fafb] bg-white flex items-center justify-center text-xs font-bold text-gray-400 border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                +12
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-64 bg-white rounded-xl px-4 py-2 border border-gray-200 flex items-center gap-2 focus-within:ring-2 ring-blue-500/20 transition-all">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Find events..." 
                  className="w-full text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {viewMode === 'month' ? (
            <CalendarGrid 
              currentMonth={currentDate} 
              events={events}
              onDateClick={(date) => {
                setSelectedDate(format(date, 'yyyy-MM-dd'));
                setIsModalOpen(true);
                setEditingEvent(null);
              }}
              onEventClick={(event) => {
                setEditingEvent(event);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <YearGrid 
              currentDate={currentDate}
              events={events}
              onMonthClick={handleMonthClick}
            />
          )}
        </div>

        <button 
          onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-400 active:scale-90 transition-all z-40"
        >
          <Plus size={30} />
        </button>
      </main>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
        editEvent={editingEvent}
      />
      
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
    active 
      ? 'bg-blue-50 text-blue-700 shadow-sm' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
  }`}>
    <span className={active ? 'text-blue-600' : 'text-gray-400'}>{icon}</span>
    {label}
  </a>
);

export default App;
