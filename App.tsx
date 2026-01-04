
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
  CalendarDays,
  List,
  Share2,
  MoreVertical,
  Activity
} from 'lucide-react';
import { format, addMonths, subMonths, addYears, subYears } from 'date-fns';
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
    if (currentView === 'overview-month') setCurrentDate(subMonths(currentDate, 1));
    else if (currentView === 'overview-year') setCurrentDate(subYears(currentDate, 1));
  };

  const handleNext = () => {
    if (currentView === 'overview-month') setCurrentDate(addMonths(currentDate, 1));
    else if (currentView === 'overview-year') setCurrentDate(addYears(currentDate, 1));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen w-full bg-[#fcfdfe] text-slate-900 overflow-hidden">
      {/* Sidebar - Floating Design */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 lg:static lg:block transform transition-transform duration-500 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full m-4 lg:mr-0 lg:my-6 lg:ml-6 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <CalendarIcon className="text-white" size={26} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">SyncTree</span>
                <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase">Workspace</span>
              </div>
            </div>

            <nav className="space-y-2">
              <NavButton 
                onClick={() => setCurrentView('overview-month')} 
                icon={<LayoutDashboard size={20} />} 
                label="Dashboard" 
                active={currentView === 'overview-month' || currentView === 'overview-year'} 
              />
              <NavButton 
                onClick={() => setCurrentView('schedule')} 
                icon={<List size={20} />} 
                label="Timeline" 
                active={currentView === 'schedule'} 
              />
              <NavButton 
                onClick={() => setCurrentView('team')} 
                icon={<Users size={20} />} 
                label="Members" 
                active={currentView === 'team'} 
              />
              <NavButton 
                onClick={() => setCurrentView('settings')} 
                icon={<Settings size={20} />} 
                label="Insights" 
                active={currentView === 'settings'} 
              />
            </nav>
          </div>

          <div className="mt-auto p-8 bg-slate-50/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <img src={MOCK_USERS[0].avatar} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white shadow-md group-hover:scale-110 transition-transform" alt="User" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">{MOCK_USERS[0].name}</span>
                <span className="text-xs font-medium text-slate-400">Workspace Owner</span>
              </div>
            </div>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
            >
              <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
              Invite Team
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 overflow-hidden">
        <header className="h-24 glass rounded-3xl mb-4 px-6 lg:px-10 flex items-center justify-between border border-white/40 shadow-sm z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
                  {currentView === 'overview-month' ? format(currentDate, 'MMMM yyyy') : 
                   currentView === 'overview-year' ? format(currentDate, 'yyyy') : 
                   currentView === 'schedule' ? 'Workspace Timeline' : 
                   currentView === 'team' ? 'Member Directory' : 'System Insights'}
                </h1>
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Live Sync</span>
                </div>
              </div>
              <p className="text-[10px] lg:text-xs font-medium text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                ID: {getWorkspaceId()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* View Selectors */}
            {(currentView === 'overview-month' || currentView === 'overview-year') && (
              <div className="hidden sm:flex bg-slate-100/50 p-1.5 rounded-2xl gap-1 border border-slate-200/20">
                <ViewToggleButton active={currentView === 'overview-month'} onClick={() => setCurrentView('overview-month')}>Month</ViewToggleButton>
                <ViewToggleButton active={currentView === 'overview-year'} onClick={() => setCurrentView('overview-year')}>Year</ViewToggleButton>
              </div>
            )}

            {/* Date Nav */}
            {(currentView === 'overview-month' || currentView === 'overview-year') && (
              <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
                <HeaderIconButton onClick={handlePrev}><ChevronLeft size={20} /></HeaderIconButton>
                <button 
                  onClick={() => { setCurrentDate(new Date()); setCurrentView('overview-month'); }}
                  className="px-4 text-[11px] font-extrabold text-slate-600 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                >
                  Now
                </button>
                <HeaderIconButton onClick={handleNext}><ChevronRight size={20} /></HeaderIconButton>
              </div>
            )}

            <div className="relative">
              <HeaderIconButton onClick={() => setShowNotifications(!showNotifications)} className="relative">
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 ring-4 ring-white rounded-full"></span>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-6 rounded-2xl shadow-xl shadow-indigo-100 flex items-center gap-2 group active:scale-95 transition-all"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden lg:inline font-bold text-sm tracking-tight">Create</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content View Container */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden animate-page">
          <div className="px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Collaborators</p>
              <div className="flex -space-x-4">
                {MOCK_USERS.map((user) => (
                  <div key={user.id} className="relative group cursor-pointer">
                    <img 
                      className="h-11 w-11 rounded-2xl ring-4 ring-[#fcfdfe] shadow-lg group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-300" 
                      src={user.avatar} 
                      alt={user.name} 
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {user.name}
                    </div>
                  </div>
                ))}
                <div className="h-11 w-11 rounded-2xl ring-4 ring-[#fcfdfe] bg-indigo-50 flex items-center justify-center text-[11px] font-bold text-indigo-600 border-2 border-dashed border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer">
                  +12
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex items-center gap-3">
              <div className="flex-1 sm:w-80 bg-white rounded-2xl px-5 py-3 border border-slate-100 flex items-center gap-3 shadow-sm focus-within:ring-2 ring-indigo-500/10 transition-all">
                <Search size={18} className="text-slate-300" />
                <input type="text" placeholder="Search workspace events..." className="w-full text-sm font-medium outline-none bg-transparent placeholder:text-slate-300" />
              </div>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
                <Activity size={20} />
              </button>
            </div>
          </div>

          {/* Render Area */}
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
          className="fixed bottom-8 right-8 lg:hidden w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-400 active:scale-90 active:rotate-45 transition-all z-40"
        >
          <Plus size={32} />
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
        <div className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[45] animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm group ${
    active 
      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    <span className={`${active ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-600'} transition-colors`}>
      {icon}
    </span>
    {label}
  </button>
);

const ViewToggleButton: React.FC<{ children: React.ReactNode, active: boolean, onClick: () => void }> = ({ children, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-[11px] font-extrabold tracking-widest uppercase transition-all ${
      active ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {children}
  </button>
);

const HeaderIconButton: React.FC<{ children: React.ReactNode, onClick: () => void, className?: string }> = ({ children, onClick, className = '' }) => (
  <button 
    onClick={onClick} 
    className={`p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all ${className}`}
  >
    {children}
  </button>
);

export default App;
