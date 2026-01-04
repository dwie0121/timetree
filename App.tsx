
import React, { useState, useEffect, useRef } from 'react';
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
  List,
  Share2,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format, addMonths, addYears } from 'date-fns';
import CalendarGrid from './components/CalendarGrid';
import YearGrid from './components/YearGrid';
import ScheduleView from './components/ScheduleView';
import TeamView from './components/TeamView';
import SettingsView from './components/SettingsView';
import EventModal from './components/EventModal';
import NotificationPanel from './components/NotificationPanel';
import ShareModal from './components/ShareModal';
import { CalendarEvent, AppNotification } from './types';
import { MOCK_USERS } from './constants';

type AppView = 'overview-month' | 'overview-year' | 'schedule' | 'team' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('overview-month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const syncChannel = useRef<BroadcastChannel | null>(null);
  const isAiActive = !!process.env.API_KEY && process.env.API_KEY !== 'undefined';

  const getWorkspaceId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ws') || 'personal-hub';
  };

  useEffect(() => {
    const wsId = getWorkspaceId();
    syncChannel.current = new BroadcastChannel(`synctree_ws_${wsId}`);
    
    syncChannel.current.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'SYNC_EVENTS') {
        setEvents(data);
        pushNotification('Workspace Updated', `Shared calendar sync completed.`, 'update');
      }
    };

    const savedEvents = localStorage.getItem(`synctree_events_${wsId}`);
    const savedNotifs = localStorage.getItem(`synctree_notifications_${wsId}`);
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      const initialEvent: CalendarEvent = {
        id: 'initial-1',
        title: 'Launch SyncTree 🚀',
        description: 'Welcome to your collaborative workspace.',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        category: 'Work',
        createdBy: 'Alex Rivera',
        attendees: ['1'],
        amount: 0,
        transactionType: 'income'
      };
      setEvents([initialEvent]);
    }

    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs).map((n: any) => ({ ...n, time: new Date(n.time) })));
    }

    return () => {
      syncChannel.current?.close();
    };
  }, []);

  useEffect(() => {
    const wsId = getWorkspaceId();
    localStorage.setItem(`synctree_events_${wsId}`, JSON.stringify(events));
  }, [events]);

  const broadcastEvents = (updatedEvents: CalendarEvent[]) => {
    syncChannel.current?.postMessage({
      type: 'SYNC_EVENTS',
      data: updatedEvents
    });
  };

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
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'attendees'>) => {
    let updatedEvents: CalendarEvent[];
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e);
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
        createdBy: MOCK_USERS[0].name,
        attendees: [MOCK_USERS[0].id]
      };
      updatedEvents = [...events, newEvent];
      pushNotification('Event Added', `${eventData.title} is now scheduled.`, 'creation');
    }
    
    setEvents(updatedEvents);
    broadcastEvents(updatedEvents);
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handlePrev = () => {
    if (currentView === 'overview-month') setCurrentDate(addMonths(currentDate, -1));
    else if (currentView === 'overview-year') setCurrentDate(addYears(currentDate, -1));
  };

  const handleNext = () => {
    if (currentView === 'overview-month') setCurrentDate(addMonths(currentDate, 1));
    else if (currentView === 'overview-year') setCurrentDate(addYears(currentDate, 1));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen w-full bg-[#fcfdfe] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 lg:static lg:block transform transition-transform duration-500 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full m-3 lg:mr-0 lg:my-4 lg:ml-4 bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 rotate-3">
                <CalendarIcon className="text-white" size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">SyncTree</span>
                <span className="text-[9px] font-bold text-indigo-500 tracking-widest uppercase">Workspace</span>
              </div>
            </div>

            <nav className="space-y-1">
              <NavButton 
                onClick={() => setCurrentView('overview-month')} 
                icon={<LayoutDashboard size={18} />} 
                label="Dashboard" 
                active={currentView === 'overview-month' || currentView === 'overview-year'} 
              />
              <NavButton 
                onClick={() => setCurrentView('schedule')} 
                icon={<List size={18} />} 
                label="Timeline" 
                active={currentView === 'schedule'} 
              />
              <NavButton 
                onClick={() => setCurrentView('team')} 
                icon={<Users size={18} />} 
                label="Members" 
                active={currentView === 'team'} 
              />
              <NavButton 
                onClick={() => setCurrentView('settings')} 
                icon={<Settings size={18} />} 
                label="Insights" 
                active={currentView === 'settings'} 
              />
            </nav>
          </div>

          <div className="mt-auto p-6 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
              <img src={MOCK_USERS[0].avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm" alt="User" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">{MOCK_USERS[0].name}</span>
                <span className="text-[10px] font-medium text-slate-400">Owner</span>
              </div>
            </div>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Share2 size={14} />
              Invite Team
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 p-3 lg:p-4 overflow-hidden">
        <header className="h-16 lg:h-18 glass rounded-2xl mb-3 px-4 lg:px-6 flex items-center justify-between border border-white/40 shadow-sm z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 leading-none">
                  {currentView === 'overview-month' ? format(currentDate, 'MMMM yyyy') : 
                   currentView === 'overview-year' ? format(currentDate, 'yyyy') : 
                   currentView === 'schedule' ? 'Timeline' : 
                   currentView === 'team' ? 'Directory' : 'Insights'}
                </h1>
                
                {/* AI Status Pill */}
                <button 
                  onClick={() => setCurrentView('settings')}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                    isAiActive 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-rose-50 border-rose-100 text-rose-600'
                  }`}
                >
                  <span className={`relative flex h-1.5 w-1.5`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAiActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isAiActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </span>
                  <span className="text-[9px] font-bold tracking-wider uppercase">
                    {isAiActive ? 'AI Active' : 'AI Setup'}
                  </span>
                </button>
              </div>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                Workspace: {getWorkspaceId()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {(currentView === 'overview-month' || currentView === 'overview-year') && (
              <div className="hidden sm:flex bg-slate-100/50 p-1 rounded-xl gap-0.5 border border-slate-200/20">
                <ViewToggleButton active={currentView === 'overview-month'} onClick={() => setCurrentView('overview-month')}>Month</ViewToggleButton>
                <ViewToggleButton active={currentView === 'overview-year'} onClick={() => setCurrentView('overview-year')}>Year</ViewToggleButton>
              </div>
            )}

            {(currentView === 'overview-month' || currentView === 'overview-year') && (
              <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                <HeaderIconButton onClick={handlePrev}><ChevronLeft size={16} /></HeaderIconButton>
                <button 
                  onClick={() => { setCurrentDate(new Date()); setCurrentView('overview-month'); }}
                  className="px-3 text-[10px] font-extrabold text-slate-600 hover:text-indigo-600 uppercase tracking-widest"
                >
                  Today
                </button>
                <HeaderIconButton onClick={handleNext}><ChevronRight size={16} /></HeaderIconButton>
              </div>
            )}

            <div className="relative">
              <HeaderIconButton onClick={() => setShowNotifications(!showNotifications)} className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 ring-2 ring-white rounded-full"></span>
                )}
              </HeaderIconButton>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus size={18} />
              <span className="hidden lg:inline font-bold text-xs">Create</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-3 lg:gap-4 overflow-hidden animate-page">
          <div className="px-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Collaborators</p>
              <div className="flex -space-x-2.5">
                {MOCK_USERS.map((user) => (
                  <img key={user.id} className="h-8 w-8 rounded-lg ring-2 ring-[#fcfdfe] shadow-sm hover:-translate-y-1 transition-transform cursor-pointer" src={user.avatar} alt={user.name} />
                ))}
                <div className="h-8 w-8 rounded-lg ring-2 ring-[#fcfdfe] bg-indigo-50 flex items-center justify-center text-[9px] font-bold text-indigo-600 border border-indigo-200 cursor-pointer">
                  +12
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex items-center gap-2">
              <div className="flex-1 sm:w-64 bg-white rounded-xl px-3 py-1.5 border border-slate-100 flex items-center gap-2 shadow-sm focus-within:ring-2 ring-indigo-500/10 transition-all">
                <Search size={14} className="text-slate-300" />
                <input type="text" placeholder="Search events..." className="w-full text-[11px] font-medium outline-none bg-transparent placeholder:text-slate-300" />
              </div>
              <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm">
                <Activity size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {currentView === 'overview-month' && (
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
            )}
            {currentView === 'overview-year' && (
              <YearGrid 
                currentDate={currentDate}
                events={events}
                onMonthClick={(month) => {
                  setCurrentDate(month);
                  setCurrentView('overview-month');
                }}
              />
            )}
            {currentView === 'schedule' && (
              <ScheduleView 
                events={events}
                onEventClick={(event) => {
                  setEditingEvent(event);
                  setIsModalOpen(true);
                }}
              />
            )}
            {currentView === 'team' && <TeamView />}
            {currentView === 'settings' && <SettingsView events={events} />}
          </div>
        </div>

        {/* Mobile FAB */}
        <button 
          onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-300 active:scale-90 transition-all z-40"
        >
          <Plus size={28} />
        </button>
      </main>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
        editEvent={editingEvent}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
      
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[45] animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold text-xs group ${
    active 
      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    <span className={`${active ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-600'}`}>
      {icon}
    </span>
    {label}
  </button>
);

const ViewToggleButton: React.FC<{ children: React.ReactNode, active: boolean, onClick: () => void }> = ({ children, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold tracking-widest uppercase transition-all ${
      active ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {children}
  </button>
);

const HeaderIconButton: React.FC<{ children: React.ReactNode, onClick: () => void, className?: string }> = ({ children, onClick, className = '' }) => (
  <button 
    onClick={onClick} 
    className={`p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all ${className}`}
  >
    {children}
  </button>
);

export default App;
