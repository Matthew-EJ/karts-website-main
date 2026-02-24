import { useState, useEffect } from 'react'
import { API_URLS } from './api.js'

// The Editor component provides the admin dashboard to add/edit/delete Announcements and Events.
const Editor = ({ onSaveSuccess, onCancel }) => {
  // UI State: Determines whether the 'announcements' or 'events' tab is active
  const [activeTab, setActiveTab] = useState('announcements')

  // Data State: Holds arrays of announcements and events fetched from the API
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])

  // Status State: Tracks if data is still loading from the server or if an error occurred
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Announcement Form State: Maintains the state of the inputs in the announcement form
  const [announcementForm, setAnnouncementForm] = useState({
    announcements: '',
    description: '',
    date: '',
    location: '',
  })
  // Track the array index of the announcement currently being edited (null if adding a new one)
  const [editingAnnouncementIndex, setEditingAnnouncementIndex] = useState(null)

  // Event Form State: Maintains the state of the inputs in the event form
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    location: '',
    description: ''
  })
  // Track the original database ID of the event currently being edited (null if adding a new one)
  const [editingEventId, setEditingEventId] = useState(null)

  // Automatically load data when the Editor component mounts to the screen
  useEffect(() => {
    fetchData()
  }, [])

  // Syncs the editor's live lists directly from the backend API
  const fetchData = async () => {
    try {
      setLoading(true)
      // Call both endpoints simultaneously to reduce total fetch time
      const [announcementsRes, eventsRes] = await Promise.all([
        fetch(API_URLS.announcements),
        fetch(API_URLS.events)
      ]);

      // If the respective fetch is successful, parse JSON into the state variables
      if (announcementsRes.ok) {
        setAnnouncements(await announcementsRes.json())
      }
      if (eventsRes.ok) {
        setEvents(await eventsRes.json())
      }
      setError(null) // Clear any previous errors upon a successful fetch
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data from server')
    } finally {
      // End the loading state allowing the UI to render results
      setLoading(false);
    }
  }

  // Updates announcementForm state seamlessly as user types
  const handleAnnouncementChange = (e) => {
    const { name, value } = e.target
    setAnnouncementForm(prev => ({ ...prev, [name]: value }))
  }

  // Sends the new announcement payload to the backend via POST
  const handleAddAnnouncement = async () => {
    // Basic form validation: make sure inputs aren't empty
    if (!announcementForm.date || !announcementForm.announcements || !announcementForm.description || !announcementForm.location) {
      alert('Please fill out all fields!')
      return;
    }

    try {
      const response = await fetch(API_URLS.announcements, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm)
      })

      // If successful, empty the form, fetch the updated list, and notify the parent App
      if (response.ok) {
        fetchData();
        setAnnouncementForm({ date: '', announcements: '', description: '', location: '' })
        alert('Announcement successfully added!')
        if (onSaveSuccess) onSaveSuccess(); // Trigger UI sync in the parent wrapper
      } else {
        setError('Failed to add announcement!')
      }
    } catch (err) {
      console.error('Error adding announcement:', err)
      setError('Failed to add announcement!')
    }
  }

  const handleEditAnnouncement = (index) => {
    setAnnouncementForm(announcements[index])
    setEditingAnnouncementIndex(index)
  }

  const handleUpdateAnnouncement = async () => {
    if (!announcementForm.date || !announcementForm.announcements || !announcementForm.description || !announcementForm.location) {
      alert('Please fill out all fields!')
      return
    }

    try {
      const idToUpdate = announcements[editingAnnouncementIndex].id || editingAnnouncementIndex;
      const response = await fetch(`${API_URLS.announcements}/${idToUpdate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm)
      })

      if (response.ok) {
        fetchData();
        handleCancelEditAnnouncement()
        alert('Announcement successfully updated!')
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setError('Failed to update announcement!')
      }
    } catch (err) {
      console.error('Error updating announcement:', err)
      setError('Failed to update announcement!')
    }
  }

  const handleDeleteAnnouncement = async (index) => {
    if (!confirm('Are you sure that you want to delete this announcement?')) return

    try {
      const idToDelete = announcements[index].id || index;
      const response = await fetch(`${API_URLS.announcements}/${idToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData();
        alert('Announcement successfully deleted!')
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setError('Failed to delete announcement!')
      }
    } catch (err) {
      console.error('Error deleting announcement:', err)
      setError('Failed to delete announcement!')
    }
  }

  const handleCancelEditAnnouncement = () => {
    setAnnouncementForm({ date: '', announcements: '', description: '', location: '' })
    setEditingAnnouncementIndex(null)
  }

  const handleEventChange = (e) => {
    const { name, value } = e.target
    setEventForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddEvent = async () => {
    if (!eventForm.name || !eventForm.date || !eventForm.location || !eventForm.description) {
      alert('Please fill out all fields!')
      return
    }

    try {
      const response = await fetch(API_URLS.events, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })

      if (response.ok) {
        fetchData();
        setEventForm({ name: '', date: '', location: '', description: '' })
        alert('Event successfully added!')
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setError('Failed to add event!')
      }
    } catch (err) {
      console.error('Error adding event:', err)
      setError('Failed to add event!')
    }
  }

  const handleEditEvent = (event) => {
    setEventForm({
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description
    })
    setEditingEventId(event.id)
  }

  const handleUpdateEvent = async () => {
    if (!eventForm.name || !eventForm.date || !eventForm.location || !eventForm.description) {
      alert('Please fill out all fields!')
      return
    }

    try {
      const response = await fetch(`${API_URLS.events}/${editingEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, id: editingEventId })
      })

      if (response.ok) {
        fetchData();
        handleCancelEditEvent();
        alert('Event successfully updated!')
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setError('Failed to update event!')
      }
    } catch (err) {
      console.error('Error updating event:', err)
      setError('Failed to update event!')
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure that you want to delete this event?')) return

    try {
      const response = await fetch(`${API_URLS.events}/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData();
        alert('Event successfully deleted!')
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setError('Failed to delete event!')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event!')
    }
  }

  const handleCancelEditEvent = () => {
    setEventForm({ name: '', date: '', location: '', description: '' })
    setEditingEventId(null)
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 sm:py-16 px-4 sm:px-6 font-['Inter']">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 sm:mb-16 gap-6">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:border-black transition-all shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Exit Editor
          </button>
          <div className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Active</span>
          </div>
        </div>

        <div className="text-center mb-16 sm:mb-24 space-y-6">
          <img src="/logo.png" alt="KARTS" className="w-16 h-16 object-contain mx-auto" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-black italic uppercase leading-none">Admin Panel</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Management Console v2.0</p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 gap-6">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Syncing...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] text-center py-6 rounded-3xl border border-red-100 mb-12 px-6">
            {error}
          </div>
        )}

        <div className="max-w-md mx-auto mb-16 sm:mb-20 flex gap-2 p-1.5 bg-white rounded-[24px] border border-gray-100 shadow-2xl shadow-black/[0.03]">
          <button
            className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500 ${activeTab === 'announcements' ? 'bg-black text-white shadow-xl shadow-black/20' : 'text-gray-300 hover:text-black hover:bg-gray-50'}`}
            onClick={() => setActiveTab('announcements')}
          >
            Announcements
          </button>
          <button
            className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500 ${activeTab === 'events' ? 'bg-black text-white shadow-xl shadow-black/20' : 'text-gray-300 hover:text-black hover:bg-gray-50'}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
        </div>

        {activeTab === 'announcements' && (
          <div className="space-y-20 sm:space-y-24">
            <section className="space-y-10 sm:space-y-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black italic uppercase text-center sm:text-left">Create Broadcast</h2>
              <form className="bg-white p-8 sm:p-14 rounded-[40px] sm:rounded-[48px] border border-gray-100 shadow-2xl shadow-black/[0.03] space-y-8 sm:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Date</label>
                    <input type="date" name="date" className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 sm:py-5 text-sm font-black transition-all focus:bg-white outline-none" value={announcementForm.date} onChange={handleAnnouncementChange} required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Location</label>
                    <input type="text" name="location" className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 sm:py-5 text-sm font-black transition-all focus:bg-white outline-none placeholder:text-gray-200" value={announcementForm.location} onChange={handleAnnouncementChange} placeholder="Enter location..." required />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Title</label>
                  <input name="announcements" className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 sm:py-5 text-sm font-black transition-all focus:bg-white outline-none placeholder:text-gray-200" value={announcementForm.announcements} onChange={handleAnnouncementChange} placeholder="Enter title..." required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Description</label>
                  <textarea name="description" className="w-full rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50/50 px-6 sm:px-8 py-4 sm:py-6 text-sm font-black transition-all focus:bg-white outline-none placeholder:text-gray-200" value={announcementForm.description} onChange={handleAnnouncementChange} placeholder="Enter announcement details..." rows="5" required />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {editingAnnouncementIndex !== null ? (
                    <>
                      <button type="button" className="flex-1 bg-black text-white py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/20" onClick={handleUpdateAnnouncement}>Update Announcement</button>
                      <button type="button" className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all" onClick={handleCancelEditAnnouncement}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="w-full bg-black text-white py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20" onClick={handleAddAnnouncement}>Create Broadcast</button>
                  )}
                </div>
              </form>
            </section>

            <section className="space-y-8 sm:space-y-12">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-100 pb-6 sm:pb-8 text-center sm:text-left">Announcement History ({announcements.length})</h3>
              <div className="grid gap-6 sm:gap-8">
                {announcements.map((ann, index) => (
                  <div key={index} className="group bg-white p-6 sm:p-12 rounded-[32px] sm:rounded-[48px] border border-gray-50 shadow-sm hover:border-black hover:bg-black transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex gap-4 items-center">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">{ann.date}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-gray-800 transition-colors" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors break-words">{ann.location}</span>
                      </div>
                      <h4 className="text-xl sm:text-3xl font-black text-gray-950 group-hover:text-white transition-colors tracking-tight italic uppercase break-words">{ann.announcements}</h4>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-500 sm:translate-x-8 group-hover:translate-x-0">
                      <button className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 bg-gray-50 text-black rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-white transition-all" onClick={() => handleEditAnnouncement(index)}>Edit</button>
                      <button className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 bg-red-50 text-red-500 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-red-500 group-hover:text-white transition-all" onClick={() => handleDeleteAnnouncement(index)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-20 sm:space-y-24">
            <section className="space-y-10 sm:space-y-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black italic uppercase text-center sm:text-left">Create Event</h2>
              <form className="bg-white p-8 sm:p-14 rounded-[40px] sm:rounded-[48px] border border-gray-100 shadow-2xl shadow-black/[0.03] space-y-8 sm:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Date</label>
                    <input type="date" name="date" className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 sm:py-5 text-sm font-black transition-all focus:bg-white outline-none" value={eventForm.date} onChange={handleEventChange} required />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Location</label>
                    <input type="text" name="location" className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 sm:py-5 text-sm font-black transition-all focus:bg-white outline-none placeholder:text-gray-200" value={eventForm.location} onChange={handleEventChange} placeholder="Enter location..." required />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Event Name</label>
                  <input type="text" name="name" className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 sm:py-5 text-sm font-black transition-all focus:bg-white outline-none placeholder:text-gray-200" value={eventForm.name} onChange={handleEventChange} placeholder="Enter event name..." required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Description</label>
                  <textarea name="description" className="w-full rounded-[24px] sm:rounded-[32px] border border-gray-100 bg-gray-50/50 px-6 sm:px-8 py-4 sm:py-6 text-sm font-black transition-all focus:bg-white outline-none placeholder:text-gray-200" value={eventForm.description} onChange={handleEventChange} placeholder="Enter event details..." rows="5" required />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {editingEventId !== null ? (
                    <>
                      <button type="button" className="flex-1 bg-black text-white py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/20" onClick={handleUpdateEvent}>Update Event</button>
                      <button type="button" className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all" onClick={handleCancelEditEvent}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="w-full bg-black text-white py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20" onClick={handleAddEvent}>Create Event</button>
                  )}
                </div>
              </form>
            </section>

            <section className="space-y-8 sm:space-y-12">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 border-b border-gray-100 pb-6 sm:pb-8 text-center sm:text-left">Event History ({events.length})</h3>
              <div className="grid gap-6 sm:gap-8">
                {events.map((event) => (
                  <div key={event.id} className="group bg-white p-6 sm:p-12 rounded-[32px] sm:rounded-[48px] border border-gray-50 shadow-sm hover:border-black hover:bg-black transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex gap-4 items-center">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">{event.date}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-gray-800 transition-colors" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors break-words">{event.location}</span>
                      </div>
                      <h4 className="text-xl sm:text-3xl font-black text-gray-950 group-hover:text-white transition-colors tracking-tight italic uppercase break-words">{event.name}</h4>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-500 sm:translate-x-8 group-hover:translate-x-0">
                      <button className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 bg-gray-50 text-black rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-white transition-all" onClick={() => handleEditEvent(event)}>Edit</button>
                      <button className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 bg-red-50 text-red-500 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-red-500 group-hover:text-white transition-all" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default Editor
