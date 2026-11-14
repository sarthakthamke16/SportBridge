import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Zap, LogOut, Radio, MapPin, FileText, User, 
  Search, Calendar, Clock, Star, CheckCircle, 
  Sparkles, ExternalLink, ShieldCheck, Check, Brain
} from 'lucide-react';
import LiveTicker from '../components/LiveTicker';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

export default function AthletePortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trials');
  const [athlete, setAthlete] = useState(null);

  // Tab 1: Trials State
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    sport: 'All sports',
    type: 'All activity types',
    age_group: 'All age groups',
    q: ''
  });
  const [applyingTo, setApplyingTo] = useState(null);
  const [pitchText, setPitchText] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // Tab 2: Clubs & Map State
  const [clubs, setClubs] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Tab 3: Applications State
  const [myApplications, setMyApplications] = useState([]);

  // Tab 4: Profile State
  const [profile, setProfile] = useState({
    name: 'Rohan Patil',
    phone: '9876543210',
    age: '19',
    city: 'Kolhapur',
    sport: 'Football',
    position: 'Striker / Forward',
    skill_level: 'State',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    career_goal: 'Play in the I-League for a professional club within 3 years',
    achievements: 'Top scorer, Kolhapur District U-19 League 2025; Maharashtra State U-19 squad'
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('sb_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user
    axios.get(`${API_BASE}/auth/me`, getAuthHeaders())
      .then(res => {
        setAthlete(res.data);
        if (res.data.name) {
          setProfile(prev => ({
            ...prev,
            ...res.data,
            phone: (res.data.phone || '').replace('+91 ', '')
          }));
        }
      })
      .catch(() => {});

    fetchActivities();
    fetchClubs();
    fetchApplications();
  }, [navigate]);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/activities`, { params: filters });
      setActivities(res.data);
    } catch (e) {}
  };

  const fetchClubs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clubs`);
      setClubs(res.data);
    } catch (e) {}
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applications/mine`, getAuthHeaders());
      setMyApplications(res.data);
    } catch (e) {}
  };

  const handleApply = async (activity = null, club = null) => {
    try {
      const payload = {
        activity_id: activity ? activity.id : null,
        activity_title: activity ? activity.title : null,
        club_id: club ? club.id : (activity ? activity.club_id : null),
        pitch_text: pitchText || 'Ready to attend trials and prove performance on the pitch.'
      };
      await axios.post(`${API_BASE}/applications`, payload, getAuthHeaders());
      setApplySuccess('Pitch sent successfully!');
      setApplyingTo(null);
      setPitchText('');
      fetchApplications();
      setTimeout(() => setApplySuccess(''), 4000);
    } catch (e) {
      alert('Failed to send application.');
    }
  };

  const toggleSelectClub = (cid) => {
    if (selectedClubs.includes(cid)) {
      setSelectedClubs(selectedClubs.filter(id => id !== cid));
    } else {
      if (selectedClubs.length >= 3) {
        alert('You can compare at most 3 clubs.');
        return;
      }
      setSelectedClubs([...selectedClubs, cid]);
    }
  };

  const handleAiCompare = async () => {
    if (selectedClubs.length < 2) {
      alert('Please select at least 2 clubs to compare with AI.');
      return;
    }
    setLoadingAi(true);
    setAiAdvice('');
    try {
      const res = await axios.get(`${API_BASE}/ai/advisor?club_ids=${selectedClubs.join(',')}`);
      setAiAdvice(res.data.advice);
    } catch (e) {
      setAiAdvice('Unable to generate AI comparison. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/auth/profile`, {
        ...profile,
        phone: `+91 ${profile.phone}`
      }, getAuthHeaders());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e) {
      alert('Error saving profile');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col font-sans selection:bg-[#FF4500] selection:text-white">
      {/* Ticker */}
      <LiveTicker />

      {/* Top Navbar */}
      <header className="h-16 border-b border-[#30363d] bg-[#161b22] px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded bg-[#FF4500] flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight uppercase">SportBridge</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 border-l border-[#30363d] pl-4 hidden sm:inline">
            Athlete Portal
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('trials')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'trials' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Live Trials
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'clubs' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Nearby Clubs & Map
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'applications' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            My Applications
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'profile' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Profile
          </button>
        </div>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-gray-300 hidden sm:block">
            {athlete?.name || 'Rohan Patil'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border border-[#30363d] hover:border-gray-400 text-gray-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden bg-[#161b22] border-b border-[#30363d] overflow-x-auto text-xs px-4">
        {[
          { id: 'trials', label: 'Live Trials' },
          { id: 'clubs', label: 'Nearby Clubs' },
          { id: 'applications', label: 'Applications' },
          { id: 'profile', label: 'Profile' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 font-bold whitespace-nowrap border-b-2 ${
              activeTab === t.id ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notification Toast */}
      {applySuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5" />
          {applySuccess}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-8">
        
        {/* ================= TAB 1: LIVE TRIALS ================= */}
        {activeTab === 'trials' && (
          <div>
            <div className="mb-6">
              <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                Real-Time Feed
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                Live Upcoming Trials & Activities
              </h1>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="City or Pin Code"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchActivities()}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FF4500]"
                />
              </div>

              <div>
                <select
                  value={filters.sport}
                  onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                >
                  <option>All sports</option>
                  <option>Football</option>
                  <option>Cricket</option>
                  <option>Athletics</option>
                  <option>Badminton</option>
                  <option>Kabaddi</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                >
                  <option>All activity types</option>
                  <option>Open Trial</option>
                  <option>Coaching Camp</option>
                  <option>Selection</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.age_group}
                  onChange={(e) => setFilters({ ...filters, age_group: e.target.value })}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                >
                  <option>All age groups</option>
                  <option>U-14</option>
                  <option>U-17</option>
                  <option>U-19</option>
                  <option>U-21</option>
                  <option>Open</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search title or club"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchActivities()}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#FF4500]"
                />
                <button
                  onClick={fetchActivities}
                  className="bg-[#FF4500] text-white px-3 py-2 rounded text-xs font-bold hover:bg-[#e03e00] transition"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trial Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act) => (
                <div key={act.id} className="bg-[#161b22] border border-[#30363d] hover:border-gray-500 p-6 rounded-lg flex flex-col justify-between gap-4 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                          LIVE · {act.activity_type} · {act.sport}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-lg uppercase text-white tracking-tight">
                      {act.title}
                    </h3>

                    <div className="text-xs text-[#FF4500] font-semibold">
                      {act.club_name}
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-400 pt-2 border-t border-[#21262d]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{act.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{act.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{act.venue}</span>
                      </div>
                      <div>Age: <span className="text-white font-bold">{act.age_group}</span></div>
                      <div>Fee: <span className="text-white font-bold">{act.entry_fee}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                    <span className="text-xs text-gray-400">{act.applied_count || 1} Athletes Applied</span>
                    <button
                      onClick={() => setApplyingTo(act)}
                      className="bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition shadow-sm"
                    >
                      Apply / Approach Club
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: NEARBY CLUBS & MAP ================= */}
        {activeTab === 'clubs' && (
          <div>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                  Scout & Compare
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                  Nearby Clubs & Map
                </h1>
              </div>

              {/* Compare with AI Trigger */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">
                  {selectedClubs.length} selected
                </span>
                <button
                  onClick={handleAiCompare}
                  disabled={selectedClubs.length < 2 || loadingAi}
                  className="bg-[#FF4500] hover:bg-[#e03e00] disabled:opacity-40 text-white font-bold text-xs uppercase px-4 py-2.5 rounded flex items-center gap-2 transition shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {loadingAi ? 'Analyzing Clubs...' : 'Compare with AI Advisor'}
                </button>
              </div>
            </div>

            {/* AI Advice Output Card */}
            {aiAdvice && (
              <div className="bg-[#1c2128] border border-[#FF4500] p-6 rounded-lg mb-8 shadow-xl">
                <div className="flex items-center gap-2 text-[#FF4500] text-xs font-black uppercase tracking-wider mb-3">
                  <Brain className="w-4 h-4" />
                  AI Scout Recommendation
                </div>
                <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiAdvice}
                </div>
              </div>
            )}

            {/* Split View: Club List + Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Club List */}
              <div className="lg:col-span-6 space-y-4">
                {clubs.map((c) => (
                  <div key={c.id} className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        {c.on_sportbridge && (
                          <span className="text-[10px] font-black text-[#FF4500] uppercase tracking-wider border border-[#FF4500]/40 px-2 py-0.5 rounded mr-2 inline-block mb-1">
                            On SportBridge
                          </span>
                        )}
                        <h3 className="font-extrabold text-base uppercase text-white">
                          {c.name}
                        </h3>
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span>{c.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-[#21262d] px-2 py-1 rounded">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{c.rating || '4.2'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(c.sports || ['Football']).map((s, idx) => (
                        <span key={idx} className="bg-[#21262d] text-gray-300 text-[11px] font-semibold px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>

                    {c.quote && (
                      <p className="text-xs text-gray-400 italic bg-[#0d1117]/60 p-2.5 rounded border border-[#21262d]">
                        "{c.quote}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#21262d] text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={selectedClubs.includes(c.id)}
                          onChange={() => toggleSelectClub(c.id)}
                          className="w-4 h-4 accent-[#FF4500] rounded"
                        />
                        <span>Select to Compare</span>
                      </label>

                      <button
                        onClick={() => handleApply(null, c)}
                        className="text-[#FF4500] hover:text-[#e03e00] font-bold text-xs uppercase flex items-center gap-1"
                      >
                        Direct Approach / Send Request →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map View */}
              <div className="lg:col-span-6 bg-[#161b22] border border-[#30363d] rounded-lg p-2 h-[520px] relative overflow-hidden flex flex-col">
                <iframe
                  title="Maharashtra Sports Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=73.5%2C16.5%2C74.6%2C18.8&amp;layer=mapnik"
                  className="rounded filter invert hue-rotate-180 brightness-90 contrast-125"
                />
                <div className="absolute top-4 left-4 bg-[#0d1117]/90 border border-[#30363d] px-3 py-1.5 rounded text-[11px] font-bold text-gray-200">
                  📍 Showing Pune & Kolhapur Clubs
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 3: MY APPLICATIONS ================= */}
        {activeTab === 'applications' && (
          <div>
            <div className="mb-6">
              <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                Decision Tracker · Updates Live
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                My Applications
              </h1>
            </div>

            <div className="space-y-4">
              {myApplications.map((app) => {
                const isShortlisted = app.status === 'approved_shortlisted';
                const isInvited = app.status === 'invited_for_trial';
                const isRejected = app.status === 'rejected';

                return (
                  <div key={app.id} className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono font-bold text-[#FF4500]">
                        {app.ref || '#SB-2026-001'}
                      </div>
                      <h3 className="font-extrabold text-base uppercase text-white">
                        {app.club_name}
                      </h3>
                      <div className="text-xs text-gray-400">
                        {app.activity_title}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Applied {app.applied_date || '13/11/2026'}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      {/* Status Badge */}
                      <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded inline-block w-max ${
                        isInvited ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                        isShortlisted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        isRejected ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-[#21262d] text-gray-300 border border-[#30363d]'
                      }`}>
                        {isInvited ? '● Invited for Trial' :
                         isShortlisted ? '● Approved / Shortlisted' :
                         isRejected ? '● Rejected' : '● Pending'}
                      </span>

                      {/* Detail / Feedback */}
                      {app.trial_datetime && (
                        <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Trial: {app.trial_datetime}
                        </div>
                      )}

                      {app.feedback && (
                        <div className="text-xs text-gray-400 italic max-w-md md:text-right">
                          "{app.feedback}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: MY PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                Athlete Profile Builder
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                My Profile
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                This profile is attached to every pitch you send.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="bg-[#161b22] border border-[#30363d] p-6 sm:p-8 rounded-lg space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>Full Name</span>
                    <span>{profile.name?.length || 0}/200</span>
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </div>
                  <div className="flex">
                    <span className="bg-[#1c2128] border border-r-0 border-[#30363d] px-3 py-2 text-xs text-gray-400 font-mono rounded-l">
                      +91
                    </span>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded-r px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Age
                  </div>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>City</span>
                    <span>{profile.city?.length || 0}/200</span>
                  </div>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Primary Sport
                  </div>
                  <select
                    value={profile.sport}
                    onChange={(e) => setProfile({ ...profile, sport: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  >
                    <option>Football</option>
                    <option>Cricket</option>
                    <option>Athletics</option>
                    <option>Badminton</option>
                    <option>Kabaddi</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>Playing Position / Specialty</span>
                    <span>{profile.position?.length || 0}/200</span>
                  </div>
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Skill Level
                  </div>
                  <select
                    value={profile.skill_level}
                    onChange={(e) => setProfile({ ...profile, skill_level: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  >
                    <option>District</option>
                    <option>State</option>
                    <option>National</option>
                  </select>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Highlight Video URL
                  </div>
                  <input
                    type="url"
                    value={profile.video_url}
                    onChange={(e) => setProfile({ ...profile, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <span>Career Goal</span>
                  <span>{profile.career_goal?.length || 0}/200</span>
                </div>
                <textarea
                  rows="2"
                  value={profile.career_goal}
                  onChange={(e) => setProfile({ ...profile, career_goal: e.target.value })}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  <span>Key Achievements</span>
                  <span>{profile.achievements?.length || 0}/200</span>
                </div>
                <textarea
                  rows="2"
                  value={profile.achievements}
                  onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                {profileSaved ? (
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Profile saved!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold text-xs uppercase px-6 py-2.5 rounded transition shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Modal: Pitch Yourself */}
      {applyingTo && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white">
              Pitch to {applyingTo.club_name}
            </h3>
            <p className="text-xs text-gray-400">
              Applying for: <span className="text-white font-bold">{applyingTo.title}</span>
            </p>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                Your Note / Pitch to Manager
              </label>
              <textarea
                rows="3"
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                placeholder="Share your current fitness, readiness, or what you bring to the team..."
                className="w-full bg-[#21262d] border border-[#30363d] rounded p-2.5 text-xs text-white outline-none focus:border-[#FF4500]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApplyingTo(null)}
                className="px-4 py-2 rounded text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApply(applyingTo)}
                className="bg-[#FF4500] hover:bg-[#e03e00] px-5 py-2 rounded text-xs font-bold text-white uppercase shadow"
              >
                Send Pitch →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
