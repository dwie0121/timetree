
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
  Share2
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
  
  // Real-time Sync Reference
  const syncChannel = useRef<BroadcastChannel | null>(null);

  // Get Workspace ID from URL
  const getWorkspaceId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ws') || 'default-workspace';
  };

  // Initialize Sync and Data
  useEffect(() => {
    const wsId = getWorkspaceId();
    
    // Set up real-time broadcast channel
    syncChannel.current = new BroadcastChannel(`synctree_ws_${wsId}`);
    
    syncChannel.current.onmessage = (event) => {
      const { type, data, sender } = event.data;
      if (type === 'SYNC_EVENTS') {
        setEvents(data);
        pushNotification('Workspace Updated', `Someone updated the shared calendar.`, 'update');
      }
    };

    const savedEvents = localStorage.getItem(`synctree_events_${wsId}`);
    const savedNotifs = localStorage.getItem(`synctree_notifications_${wsId}`);
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
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

  // Sync to Local Storage and Broadcast
  useEffect(() => {
    const wsId = getWorkspaceId();
    localStorage.setItem(`synctree_events_${wsId}`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const wsId = getWorkspaceId();
    localStorage.setItem(`synctree_notifications_${wsId}`, JSON.stringify(notifications));
  }, [notifications]);

  const broadcastEvents = (updatedEvents: CalendarEvent[]) => {
    syncChannel.current?.postMessage({
      type: 'SYNC_EVENTS',
      data: updatedEvents,
      sender: MOCK_USERS[0].name
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
      pushNotification('Event Updated', `${eventData.title} was changed.`, 'update');
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
        createdBy: MOCK_USERS[0].name,
        attendees: [MOCK_USERS[0].id]
      };
      updatedEvents = [...events, newEvent];
      pushNotification('New Event Created', `${MOCK_USERS[0].name} added "${eventData.title}"`, 'creation');
    }
    
    setEvents(updatedEvents);
    broadcastEvents(updatedEvents); // Broadcast to other tabs
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

  const getViewTitle = () => {
    switch (currentView) {
      case 'overview-month': return format(currentDate, 'MMMM yyyy');
      case 'overview-year': return format(currentDate, 'yyyy');
      case 'schedule': return 'My Schedule';
      case 'team': return 'Team Shared';
      case 'settings': return 'Settings & Finance';
      default: return 'SyncTree';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderContent = () => {
    switch (currentView) {
      case 'overview-month':
        return (
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
        );
      case 'overview-year':
        return (
          <YearGrid 
            currentDate={currentDate}
            events={events}
            onMonthClick={(month) => {
              setCurrentDate(month);
              setCurrentView('overview-month');
            }}
          />
        );
      case 'schedule':
        return (
          <ScheduleView 
            events={events}
            onEventClick={(event) => {
              setEditingEvent(event);
              setIsModalOpen(true);
            }}
          />
        );
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView events={events} />;
      default:
        return null;
    }
  };

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
            <button className="w-full text-left" onClick={() => setCurrentView('overview-month')}>
              <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={currentView === 'overview-month' || currentView === 'overview-year'} />
            </button>
            <button className="w-full text-left" onClick={() => setCurrentView('schedule')}>
              <NavItem icon={<List size={20} />} label="My Schedule" active={currentView === 'schedule'} />
            </button>
            <button className="w-full text-left" onClick={() => setCurrentView('team')}>
              <NavItem icon={<Users size={20} />} label="Team Shared" active={currentView === 'team'} />
            </button>
            <button className="w-full text-left" onClick={() => setCurrentView('settings')}>
              <NavItem icon={<Settings size={20} />} label="Settings" active={currentView === 'settings'} />
            </button>
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
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500">Shared Workspace</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm">Live Sync</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
            >
              <Share2 size={18} />
              <span className="hidden lg:inline text-xs">Share</span>
            </button>

            {(currentView === 'overview-month' || currentView === 'overview-year') && (
              <div className="hidden md:flex bg-gray-100 rounded-xl p-1 gap-1 mr-2">
                <button 
                  onClick={() => setCurrentView('overview-month')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'overview-month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setCurrentView('overview-year')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'overview-year' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Year
                </button>
              </div>
            )}

            {(currentView === 'overview-month' || currentView === 'overview-year') && (
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button onClick={handlePrev} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => { setCurrentDate(new Date()); setCurrentView('overview-month'); }}
                  className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-bold text-gray-600"
                >
                  Today
                </button>
                <button onClick={handleNext} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all relative group">
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
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 active:scale-95 group transition-all"
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
                <img key={user.id} className="inline-block h-10 w-10 rounded-full ring-4 ring-[#f9fafb] shadow-sm hover:translate-y-[-4px] transition-all cursor-pointer" src={user.avatar} alt={user.name} />
              ))}
              <div className="h-10 w-10 rounded-full ring-4 ring-[#f9fafb] bg-white flex items-center justify-center text-xs font-bold text-gray-400 border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                +12
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-64 bg-white rounded-xl px-4 py-2 border border-gray-200 flex items-center gap-2 focus-within:ring-2 ring-blue-500/20 transition-all">
                <Search size={18} className="text-gray-400" />
                <input type="text" placeholder="Find events..." className="w-full text-sm outline-none bg-transparent" />
              </div>
            </div>
          </div>

          {renderContent()}
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

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
      
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
    active 
      ? 'bg-blue-50 text-blue-700 shadow-sm' 
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
  }`}>
    <span className={active ? 'text-blue-600' : 'text-gray-400'}>{icon}</span>
    {label}
  </div>
);

export default App;
