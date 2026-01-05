import React, { useState, useEffect, useCallback } from 'react';
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
  Cloud,
  CloudOff
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
import { supabase, safeGetEnv } from './services/supabaseClient';

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
  const [dbConnected, setDbConnected] = useState(!!supabase);
  
  // Safe environment check using utility
  const isAiActive = !!(safeGetEnv('VITE_API_KEY') || safeGetEnv('API_KEY'));

  const getWorkspaceId = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ws') || 'personal-hub';
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('workspace_id', getWorkspaceId());
    
    if (error) {
      console.error("Supabase fetch error:", error);
    } else if (data) {
      const mappedEvents: CalendarEvent[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        category: item.category,
        createdBy: item.created_by,
        attendees: item.attendees,
        amount: item.amount,
        transactionType: item.transaction_type
      }));
      setEvents(mappedEvents);
    }
  }, [getWorkspaceId]);

  useEffect(() => {
    const wsId = getWorkspaceId();
    
    if (supabase) {
      fetchEvents();

      const subscription = supabase
        .channel(`ws_events_${wsId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'events',
          filter: `workspace_id=eq.${wsId}`
        }, (payload) => {
          fetchEvents();
          if (payload.eventType === 'INSERT') {
            pushNotification('Workspace Update', 'New event shared by a teammate.', 'creation');
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const savedEvents = localStorage.getItem(`synctree_events_${wsId}`);
      if (savedEvents) setEvents(JSON.parse(savedEvents));
    }
  }, [getWorkspaceId, fetchEvents]);

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

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdBy' | 'attendees'>) => {
    const wsId = getWorkspaceId();
    
    if (supabase) {
      const { error } = await supabase
        .from('events')
        .upsert({
          id: editingEvent?.id,
          workspace_id: wsId,
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          category: eventData.category,
          created_by: editingEvent?.createdBy || MOCK_USERS[0].name,
          attendees: editingEvent?.attendees || [MOCK_USERS[0].id],
          amount: eventData.amount,
          transaction_type: eventData.transactionType
        });

      if (error) {
        console.error("Supabase Save Error:", error);
      } else {
        setIsModalOpen(false);
        setEditingEvent(null);
      }
    } else {
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
      localStorage.setItem(`synctree_events_${wsId}`, JSON.stringify(updatedEvents));
      setIsModalOpen(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const wsId = getWorkspaceId();
    
    if (supabase) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Supabase Delete Error:", error);
      } else {
        setIsModalOpen(false);
        setEditingEvent(null);
      }
    } else {
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem(`synctree_events_${wsId}`, JSON.stringify(updatedEvents));
      setIsModalOpen(false);
      setEditingEvent(null);
      pushNotification('Event Removed', 'The event has been deleted.', 'update');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen w-full bg-[#fcfdfe] text-slate-900 overflow-hidden">
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
                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
                  dbConnected ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  {dbConnected ? <Cloud size={10} /> : <CloudOff size={10} />}
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    {dbConnected ? 'Sync Live' : 'Local Only'}
                  </span>
                </div>
              </div>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                Workspace: {getWorkspaceId()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
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
        onDelete={handleDeleteEvent}
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

const HeaderIconButton: React.FC<{ children: React.ReactNode, onClick: () => void, className?: string }> = ({ children, onClick, className = '' }) => (
  <button 
    onClick={onClick} 
    className={`p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all ${className}`}
  >
    {children}
  </button>
);

export default App;
