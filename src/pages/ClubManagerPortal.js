import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Zap, LogOut, Users, Send, Building, 
  CheckCircle2, Clock, Check, X, Phone, 
  MapPin, Star, Calendar, RefreshCw
} from 'lucide-react';
import LiveTicker from '../components/LiveTicker';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

export default function ClubManagerPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [manager, setManager] = useState(null);

  // Requests Tab State
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState('all');
  const [inviteModal, setInviteModal] = useState(null);
  const [trialDateTime, setTrialDateTime] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('Please report at the turf with boots and ID proof.');

  // Publish Tab State
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [trialForm, setTrialForm] = useState({
    title: 'U-21 Open Football Selection',
    sport: 'Football',
    activity_type: 'Open Trial',
    date: '28-11-2026',
    time: '07:00',
    venue: 'Deccan Gymkhana Turf, Pune',
    age_group: 'U-21',
    entry_fee: '0'
  });
  const [publishSuccess, setPublishSuccess] = useState('');

  // Profile Tab State
  const [clubProfile, setClubProfile] = useState({
    id: '',
    name: 'Deccan Football Academy',
    city: 'Pune',
    pin_code: '411004',
    address: 'Near Deccan Gymkhana, Pune',
    phone: '9822000001',
    fees: '₹2,500/month',
    sports: ['Football'],
    facilities: 'FIFA Standard Turf, Video Analysis Room, Strength & Conditioning',
    reviews: [
      { author: 'Aditya K.', rating: 5, text: 'Excellent coaching staff, very structured sessions and regular match exposure in Pune leagues.' },
      { author: 'Meera S.', rating: 4, text: 'Turf ground is well maintained but the evening batches are overcrowded on weekdays.' },
      { author: 'Rahul D.', rating: 3, text: 'Good coaching but extra kit fees were charged mid-season without clear notice.' }
    ]
  });
  const [fetchingReviews, setFetchingReviews] = useState(false);

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

    axios.get(`${API_BASE}/auth/me`, getAuthHeaders())
      .then(res => setManager(res.data))
      .catch(() => {});

    fetchIncomingRequests();
    fetchClubActivities();
    fetchManagerClub();
  }, [navigate]);

  const fetchIncomingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applications/incoming`, getAuthHeaders());
      setRequests(res.data);
    } catch (e) {}
  };

  const fetchClubActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/activities`);
      setUpcomingActivities(res.data);
    } catch (e) {}
  };

  const fetchManagerClub = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clubs`);
      const deccan = res.data.find(c => c.name.includes('Deccan')) || res.data[0];
      if (deccan) {
        setClubProfile({
          ...deccan,
          phone: (deccan.phone || '').replace('+91 ', ''),
          facilities: Array.isArray(deccan.facilities) ? deccan.facilities.join(', ') : (deccan.facilities || '')
        });
      }
    } catch (e) {}
  };

  const handleUpdateStatus = async (appId, status, feedback = '', trialDt = '') => {
    try {
      await axios.put(`${API_BASE}/applications/${appId}/status`, {
        status,
        feedback,
        trial_datetime: trialDt
      }, getAuthHeaders());
      setInviteModal(null);
      fetchIncomingRequests();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handlePublishTrial = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/activities`, {
        ...trialForm,
        entry_fee: trialForm.entry_fee === '0' || !trialForm.entry_fee ? 'Free' : `₹${trialForm.entry_fee}`
      }, getAuthHeaders());
      setPublishSuccess('Trial published successfully & live on feed!');
      fetchClubActivities();
      setTimeout(() => setPublishSuccess(''), 4000);
    } catch (e) {
      alert('Error publishing trial');
    }
  };

  const handleSaveClubProfile = async (e) => {
    e.preventDefault();
    try {
      if (clubProfile.id) {
        await axios.put(`${API_BASE}/clubs/${clubProfile.id}/profile`, {
          ...clubProfile,
          phone: `+91 ${clubProfile.phone}`,
          facilities: clubProfile.facilities.split(',').map(s => s.trim())
        }, getAuthHeaders());
      }
      alert('Club profile updated!');
    } catch (e) {
      alert('Error updating club profile');
    }
  };

  const handleFetchReviews = async () => {
    setFetchingReviews(true);
    try {
      if (clubProfile.id) {
        const res = await axios.get(`${API_BASE}/clubs/${clubProfile.id}/google-reviews`);
        if (res.data.reviews) {
          setClubProfile(prev => ({ ...prev, reviews: res.data.reviews }));
        }
      }
    } catch (e) {
    } finally {
      setFetchingReviews(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Filter calculations
  const totalReceived = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved_shortlisted').length;
  const invitedCount = requests.filter(r => r.status === 'invited_for_trial').length;

  const filteredRequests = requests.filter(r => {
    if (requestFilter === 'pending') return r.status === 'pending';
    if (requestFilter === 'shortlisted') return r.status === 'approved_shortlisted';
    if (requestFilter === 'invited') return r.status === 'invited_for_trial';
    if (requestFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

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
            Club Manager Workspace
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'requests' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Athlete Requests
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'publish' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Publish Trial
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
              activeTab === 'profile' ? 'bg-[#21262d] text-[#FF4500]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Club Profile & Reviews
          </button>
        </div>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-gray-300 hidden sm:block">
            {manager?.name || 'Coach Vikram Pawar'}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-8">

        {/* ================= TAB 1: ATHLETE REQUESTS CRM ================= */}
        {activeTab === 'requests' && (
          <div>
            <div className="mb-6">
              <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                Recruitment CRM
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                Incoming Athlete Requests
              </h1>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg">
                <div className="text-3xl font-black text-white">{totalReceived}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Total Requests Received
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg">
                <div className="text-3xl font-black text-amber-400">{pendingCount}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Pending Review
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg">
                <div className="text-3xl font-black text-emerald-400">{approvedCount}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Approved / Shortlisted
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg">
                <div className="text-3xl font-black text-cyan-400">{invitedCount}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Invited for Trial
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-[#30363d] gap-6 text-xs font-bold uppercase tracking-wider mb-6">
              {[
                { id: 'all', label: 'All Requests' },
                { id: 'pending', label: 'Pending' },
                { id: 'shortlisted', label: 'Approved / Shortlisted' },
                { id: 'invited', label: 'Invited for Trial' },
                { id: 'rejected', label: 'Rejected' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setRequestFilter(t.id)}
                  className={`pb-3 border-b-2 transition ${
                    requestFilter === t.id ? 'border-[#FF4500] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Request Cards */}
            <div className="space-y-4">
              {filteredRequests.map((r) => {
                const isShortlisted = r.status === 'approved_shortlisted';
                const isInvited = r.status === 'invited_for_trial';
                const isRejected = r.status === 'rejected';

                return (
                  <div key={r.id} className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#FF4500]">
                          {r.ref || '#SB-2026-004'}
                        </span>
                        <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          isInvited ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                          isShortlisted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          isRejected ? 'bg-red-950 text-red-400 border border-red-800' :
                          'bg-[#21262d] text-gray-400'
                        }`}>
                          {isInvited ? 'Invited for Trial' :
                           isShortlisted ? 'Approved / Shortlisted' :
                           isRejected ? 'Rejected' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {r.activity_title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <h3 className="font-extrabold text-xl uppercase tracking-tight text-white">
                          {r.athlete_name}
                        </h3>
                        <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {r.athlete_skill_level || 'District'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
                        <span className="font-mono text-emerald-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {r.athlete_phone}
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1 rounded ml-1 font-sans font-bold">VERIFIED</span>
                        </span>
                        <span>{r.athlete_age} yrs</span>
                        <span>{r.athlete_city}</span>
                        <span className="text-white font-semibold">{r.athlete_sport} · {r.athlete_position}</span>
                      </div>

                      {r.athlete_career_goal && (
                        <div className="text-xs text-gray-300">
                          🎯 <span className="text-gray-400">{r.athlete_career_goal}</span>
                        </div>
                      )}

                      {r.athlete_achievements && (
                        <div className="text-xs text-gray-300">
                          🏅 <span className="text-gray-400">{r.athlete_achievements}</span>
                        </div>
                      )}

                      {r.pitch_text && (
                        <div className="text-xs text-gray-400 italic bg-[#0d1117]/80 p-2.5 rounded border border-[#21262d]">
                          "{r.pitch_text}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved_shortlisted', 'Profile shortlisted for squad pool.')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Shortlist
                      </button>

                      <button
                        onClick={() => setInviteModal(r)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded flex items-center justify-center gap-1.5 transition"
                      >
                        <Calendar className="w-4 h-4" />
                        Approve & Invite for Trial
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(r.id, 'rejected', 'Slots full at this time.')}
                        className="border border-[#30363d] hover:border-red-500 text-gray-400 hover:text-red-400 font-bold text-xs uppercase px-4 py-2.5 rounded flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        Reject / Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PUBLISH TRIAL ================= */}
        {activeTab === 'publish' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="mb-6">
                <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                  Goes Live Instantly
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                  Publish a New Trial
                </h1>
              </div>

              {publishSuccess && (
                <div className="bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs p-3.5 rounded-lg mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {publishSuccess}
                </div>
              )}

              <form onSubmit={handlePublishTrial} className="bg-[#161b22] border border-[#30363d] p-6 sm:p-8 rounded-lg space-y-5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>Title</span>
                    <span>{trialForm.title.length}/200</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={trialForm.title}
                    onChange={(e) => setTrialForm({ ...trialForm, title: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Sport
                    </label>
                    <select
                      value={trialForm.sport}
                      onChange={(e) => setTrialForm({ ...trialForm, sport: e.target.value })}
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
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Activity Type
                    </label>
                    <select
                      value={trialForm.activity_type}
                      onChange={(e) => setTrialForm({ ...trialForm, activity_type: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    >
                      <option>Open Trial</option>
                      <option>Coaching Camp</option>
                      <option>Selection Camp</option>
                      <option>Walkout</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="text"
                      placeholder="dd-mm-yyyy"
                      value={trialForm.date}
                      onChange={(e) => setTrialForm({ ...trialForm, date: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Time
                    </label>
                    <input
                      type="text"
                      placeholder="07:00"
                      value={trialForm.time}
                      onChange={(e) => setTrialForm({ ...trialForm, time: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>Venue</span>
                    <span>{trialForm.venue.length}/200</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={trialForm.venue}
                    onChange={(e) => setTrialForm({ ...trialForm, venue: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Age Group
                    </label>
                    <select
                      value={trialForm.age_group}
                      onChange={(e) => setTrialForm({ ...trialForm, age_group: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    >
                      <option>U-14</option>
                      <option>U-17</option>
                      <option>U-19</option>
                      <option>U-21</option>
                      <option>Open</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={trialForm.entry_fee}
                      onChange={(e) => setTrialForm({ ...trialForm, entry_fee: e.target.value })}
                      placeholder="0 for free"
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold py-3 px-4 rounded text-xs uppercase tracking-wide transition shadow-lg shadow-orange-950/40"
                >
                  Publish Trial →
                </button>
              </form>
            </div>

            {/* Upcoming Activities Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                Your Upcoming Activities
              </span>

              <div className="space-y-3 pt-1">
                {upcomingActivities.map((act) => (
                  <div key={act.id} className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {act.activity_type} · {act.sport} · {act.age_group}
                    </div>
                    <h4 className="font-extrabold text-base uppercase text-white">
                      {act.title}
                    </h4>
                    <div className="text-xs text-gray-400 flex items-center justify-between pt-2 border-t border-[#21262d]">
                      <span>{act.date} · {act.time}</span>
                      <span className="text-emerald-400 font-semibold">{act.applied_count || 1} applied</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: CLUB PROFILE & REVIEWS ================= */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Club Details Form */}
            <div className="lg:col-span-7">
              <div className="mb-6">
                <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                  Academy Details
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
                  Club Profile
                </h1>
              </div>

              <form onSubmit={handleSaveClubProfile} className="bg-[#161b22] border border-[#30363d] p-6 sm:p-8 rounded-lg space-y-5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>Academy / Club Name</span>
                    <span>{clubProfile.name?.length || 0}/200</span>
                  </div>
                  <input
                    type="text"
                    value={clubProfile.name}
                    onChange={(e) => setClubProfile({ ...clubProfile, name: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      <span>City</span>
                      <span>{clubProfile.city?.length || 0}/200</span>
                    </div>
                    <input
                      type="text"
                      value={clubProfile.city}
                      onChange={(e) => setClubProfile({ ...clubProfile, city: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      value={clubProfile.pin_code}
                      onChange={(e) => setClubProfile({ ...clubProfile, pin_code: e.target.value })}
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <span>Address</span>
                    <span>{clubProfile.address?.length || 0}/200</span>
                  </div>
                  <input
                    type="text"
                    value={clubProfile.address}
                    onChange={(e) => setClubProfile({ ...clubProfile, address: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <span className="bg-[#1c2128] border border-r-0 border-[#30363d] px-3 py-2 text-xs text-gray-400 font-mono rounded-l">
                        +91
                      </span>
                      <input
                        type="text"
                        value={clubProfile.phone}
                        onChange={(e) => setClubProfile({ ...clubProfile, phone: e.target.value })}
                        className="w-full bg-[#21262d] border border-[#30363d] rounded-r px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Fees
                    </label>
                    <input
                      type="text"
                      value={clubProfile.fees}
                      onChange={(e) => setClubProfile({ ...clubProfile, fees: e.target.value })}
                      placeholder="₹2,500/month"
                      className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Sports Offered
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Football', 'Cricket', 'Athletics', 'Badminton', 'Kabaddi'].map((sport) => {
                      const isSelected = (clubProfile.sports || []).includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => {
                            const cur = clubProfile.sports || [];
                            const updated = isSelected ? cur.filter(s => s !== sport) : [...cur, sport];
                            setClubProfile({ ...clubProfile, sports: updated });
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full font-bold transition border ${
                            isSelected ? 'bg-[#FF4500] border-[#FF4500] text-white' : 'bg-[#21262d] border-[#30363d] text-gray-400 hover:text-white'
                          }`}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Facilities (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={clubProfile.facilities}
                    onChange={(e) => setClubProfile({ ...clubProfile, facilities: e.target.value })}
                    className="w-full bg-[#21262d] border border-[#30363d] rounded px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold text-xs uppercase px-6 py-2.5 rounded transition shadow-md"
                >
                  Save Profile
                </button>
              </form>
            </div>

            {/* Reviews On File Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
                  Reviews on File · ★ 4.5
                </span>
              </div>

              <div className="space-y-3">
                {(clubProfile.reviews || []).map((rev, idx) => (
                  <div key={idx} className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{rev.author}</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {rev.text}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleFetchReviews}
                disabled={fetchingReviews}
                className="w-full bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-300 font-semibold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingReviews ? 'animate-spin' : ''}`} />
                {fetchingReviews ? 'Connecting...' : 'Fetch public internet reviews (Google)'}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Modal: Approve & Invite for Trial */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white">
              Invite {inviteModal.athlete_name} for Trial
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                Trial Date & Time
              </label>
              <input
                type="text"
                placeholder="2026-11-28 07:00"
                value={trialDateTime}
                onChange={(e) => setTrialDateTime(e.target.value)}
                className="w-full bg-[#21262d] border border-[#30363d] rounded p-2 text-xs text-white outline-none focus:border-[#FF4500]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                Instructions for Athlete
              </label>
              <textarea
                rows="3"
                value={inviteFeedback}
                onChange={(e) => setInviteFeedback(e.target.value)}
                className="w-full bg-[#21262d] border border-[#30363d] rounded p-2 text-xs text-white outline-none focus:border-[#FF4500]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInviteModal(null)}
                className="px-4 py-2 rounded text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(inviteModal.id, 'invited_for_trial', inviteFeedback, trialDateTime || '2026-11-28 07:00')}
                className="bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded text-xs font-bold text-white uppercase shadow"
              >
                Confirm Invitation →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
