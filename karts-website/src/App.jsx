import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './Login.jsx';
import Editor from './Editor.jsx';

// Import our centralized API endpoint URLs
import { API_URLS } from './api.js';

const App = () => {
  // Application View State: Controls whether the user sees the 'home' page, 'login' screen, or 'Editor' admin panel
  const [view, setView] = useState('home');
  // Authentication State: Derived directly from localStorage on initial load
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  // Calendar State: Tracks the currently viewed month/year in the UI
  const [currentDate, setCurrentDate] = useState(new Date());
  // Data State: Holds events and announcements retrieved from the backend API
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  // UI State: Controls the global loading spinner state
  const [loading, setLoading] = useState(true);
  // Modal States: Track which event or date is currently selected to show popup overlays
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dailyEventsModal, setDailyEventsModal] = useState(null); // format: { date: string, events: [] }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Async callback to fetch both Events and Announcements from the backend in parallel
  const refreshData = useCallback(async () => {
    try {
      // Fire off both API call promises at the same time for faster loading
      const [resEvents, resAnnu] = await Promise.all([
        fetch(API_URLS.events),
        fetch(API_URLS.announcements)
      ]);

      // Parse JSON from both responses
      const dataEvents = await resEvents.json();
      const dataAnnu = await resAnnu.json();

      // Ensure the returned data is an array before setting state, fallback to empty arrays to prevent mapping errors
      setEvents(Array.isArray(dataEvents) ? dataEvents : []);
      setAnnouncements(Array.isArray(dataAnnu) ? dataAnnu : []);
    } catch (err) {
      console.error("Failed to synchronize data:", err);
    } finally {
      // Always stop the loading spinner, even if the requests fail
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);


  // Month is 0-indexed while day is 1-indexed
  // Date Calculation Variables for the Calendar UI
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based month (0 = Jan, 11 = Dec)
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of week the month starts on (0 = Sun, 6 = Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Number of days in the current month
  const today = new Date();

  // Helper functions to navigate between months
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Handler triggered when a specific date box on the calendar is clicked
  const handleDateClick = (dateStr, dayEvents) => {
    // Only open the modal if there are events assigned to this day
    if (dayEvents.length > 0) {
      setDailyEventsModal({ date: dateStr, events: dayEvents });
    }
  };

  // Dynamically generates the grid cells for the calendar UI
  const renderCalendarCells = () => {
    const cells = [];

    // 1. Generate empty "padding" boxes for the days of the week before the 1st day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="p-1 sm:p-4 min-h-[50px] sm:min-h-[110px]" />);
    }

    // 2. Generate actual date cells
    for (let day = 1; day <= daysInMonth; day++) {
      // Determine if the cell we are iterating over represents today's current date
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      // Format the cell's date into 'YYYY-MM-DD' structure to match the backend data structure
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // Filter out only the events matching this cell's specific date
      const dayEvents = events.filter(e => e.date === dateStr);
      const hasEvents = dayEvents.length > 0;

      cells.push(
        <div
          key={day}
          // Attach click listener to show events popup if any exist
          onClick={() => handleDateClick(dateStr, dayEvents)}
          // Apply conditional styling for highlighting the current day
          className={`relative overflow-hidden transition-all duration-200 rounded-xl sm:rounded-2xl p-1 sm:p-4 min-h-[50px] sm:min-h-[110px] border flex flex-col items-center sm:items-stretch gap-1 cursor-pointer hover:border-black/20 ${isToday ? "bg-gray-50 border-black/10" : "bg-white border-gray-50"}`}
        >
          <div className="flex justify-between items-start w-full">
            <span className={`text-[12px] sm:text-[13px] font-bold ${isToday ? 'text-black' : 'text-gray-400'}`}>{day}</span>
            {hasEvents && (
              <div className="flex gap-0.5">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black shadow-sm" />
                {dayEvents.length > 1 && <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black/20" />}
              </div>
            )}
          </div>

          <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-y-auto max-h-[60px] scrollbar-hide">
            {dayEvents.map((ev, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(ev);
                }}
                className="bg-black text-white rounded-md px-2 py-1 shadow-sm cursor-pointer hover:scale-[1.05] transition-transform active:scale-95"
              >
                <p className="text-[9px] font-black break-words uppercase tracking-tighter">{ev.name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  // Helper handling logout operations by clearing tokens and resetting user routing state
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setIsLoggedIn(false);
    setView('home');  // Return user to the public landing page directly
  };

  if (view === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setView('Editor');
        }}
        onCancel={() => setView('home')}
      />
    );
  }

  if (view === 'Editor') {
    if (!isLoggedIn) {
      setView('login');
      return null;
    }
    return (
      <Editor
        onSaveSuccess={() => refreshData()}
        onCancel={() => setView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-950 selection:bg-black selection:text-white pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="KARTS" className="w-9 h-9 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="hidden w-9 h-9 bg-black rounded-xl items-center justify-center transform rotate-3">
                <span className="text-white text-sm font-black italic">K</span>
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">KARTS</span>
            </div>
            <div className="flex items-center gap-8">
              {isLoggedIn ? (
                <div className="flex items-center gap-4 sm:gap-8">
                  <button onClick={() => setView('Editor')} className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-colors">Admin Panel</button>
                  <button onClick={handleLogout} className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-colors">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => setView('login')}
                  className="bg-black text-white px-6 sm:px-8 py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >Access Portal</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-20 sm:space-y-32">
        {/* Calendar Section */}
        <section className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-12 shadow-2xl shadow-black/[0.02]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic">{monthNames[month]} {year}</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Activity Calendar</p>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-6">
              <div className="flex gap-2">
                <button onClick={prevMonth} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-black hover:text-white transition-all duration-300 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button onClick={nextMonth} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-black hover:text-white transition-all duration-300 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>

              {isLoggedIn && (
                <button
                  onClick={() => setView('Editor')}
                  className="bg-black text-white text-[9px] sm:text-[10px] font-black px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:scale-105 transition shadow-2xl shadow-black/20 tracking-[0.2em] uppercase"
                >
                  Add Event
                </button>
              )}
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-6 sm:mb-8 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-4">{renderCalendarCells()}</div>
          </div>
        </section>

        {/* Announcements Section */}
        <section className="space-y-12 sm:space-y-16">
          <div className="flex items-end justify-between border-b border-gray-100 pb-8">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic">Announcements</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Latest Updates</p>
            </div>
          </div>

          <div className="grid gap-8 sm:gap-10">
            {loading ? (
              <div className="text-center py-20 flex flex-col items-center gap-6">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Loading Feed...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No active updates.</p>
              </div>
            ) : (
              announcements.map((ann, idx) => (
                <div key={idx} className="group bg-white p-8 sm:p-12 border border-gray-100 rounded-[32px] sm:rounded-[40px] hover:bg-black hover:border-black transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-black/10">
                  <div className="flex flex-col gap-6 sm:gap-8">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] sm:text-[10px] font-black text-gray-400 group-hover:text-gray-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-colors">{ann.date}</span>
                      <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gray-50 group-hover:bg-white/10 rounded-full transition-colors border border-gray-100 group-hover:border-transparent">
                        <span className="text-[8px] sm:text-[9px] font-black group-hover:text-white uppercase tracking-widest text-gray-950">Update</span>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-xl sm:text-3xl font-black text-gray-950 group-hover:text-white transition-colors tracking-tight leading-tight uppercase italic break-words">{ann.announcements}</h3>
                      <p className="text-gray-500 group-hover:text-gray-400 text-sm sm:text-lg leading-relaxed max-w-3xl transition-colors break-words">{ann.description}</p>
                    </div>
                    {ann.location && (
                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                          <svg className="text-gray-400 group-hover:text-white" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-[0.2em] transition-colors break-words">{ann.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="py-20 sm:py-32 bg-white border-t border-gray-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
          <img src="/logo.png" alt="KARTS" className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div className="hidden w-12 h-12 bg-gray-50 rounded-[20px] items-center justify-center transform hover:rotate-12 transition-transform">
            <span className="text-gray-300 text-sm font-black italic">K</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] sm:tracking-[0.5em]">KARTS SYSTEM &bull; v2.0.5</p>
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-200 uppercase tracking-[0.2em] sm:tracking-[0.3em]">&copy; 2026 Academic Excellence Network</p>
          </div>
        </div>
      </footer>

      {/* Daily Events List Modal (Mobile-Friendly) */}
      {dailyEventsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={() => setDailyEventsModal(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{dailyEventsModal.date}</h3>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{dailyEventsModal.events.length} Events Scheduled</p>
              </div>
              <button onClick={() => setDailyEventsModal(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-black hover:text-white transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              {dailyEventsModal.events.map((ev, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setDailyEventsModal(null);
                  }}
                  className="p-5 bg-gray-50 rounded-[20px] border border-gray-100 hover:bg-black hover:border-black group transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-black group-hover:text-white uppercase italic tracking-tight break-words">{ev.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 group-hover:text-gray-500 uppercase tracking-widest">{ev.location}</p>
                    </div>
                    <svg className="text-gray-300 group-hover:text-white" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center px-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          <div
            className="relative w-full max-w-xl bg-white rounded-[40px] p-8 sm:p-14 shadow-2xl transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-50 hover:bg-black hover:text-white transition-all duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <div className="space-y-8 sm:space-y-10">
              <div className="space-y-3">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-300">Event Details</span>
                <h3 className="text-3xl sm:text-5xl font-black tracking-tighter text-black leading-tight uppercase italic break-words">{selectedEvent.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:gap-10 border-y border-gray-100 py-8 sm:py-10">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Date</p>
                  <p className="text-sm sm:text-base font-black text-black">{selectedEvent.date}</p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Location</p>
                  <p className="text-sm sm:text-base font-black text-black">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Description</p>
                <p className="text-gray-500 text-sm sm:text-lg leading-relaxed break-words">{selectedEvent.description}</p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full bg-black text-white py-5 rounded-3xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;