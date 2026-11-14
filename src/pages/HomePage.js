import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, Brain, ShieldCheck, ClipboardCheck, Trophy, Users, ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';
import LiveTicker from '../components/LiveTicker';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active_clubs: 8, open_trials: 6, applications: 8 });
  const [trials, setTrials] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/stats`).then(res => setStats(res.data)).catch(() => {});
    axios.get(`${API_BASE}/activities`).then(res => setTrials(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col font-sans selection:bg-[#FF4500] selection:text-white">
      {/* Live Activity Ticker */}
      <LiveTicker />

      {/* Main Navbar */}
      <nav className="h-16 border-b border-[#30363d] bg-[#161b22] px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded bg-[#FF4500] flex items-center justify-center font-black shadow-md text-white">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight uppercase">SportBridge</span>
        </div>

        {/* Region Pills */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#FF4500]" />
          <span>Kolhapur · Sangli · Ichalkaranji · Pune</span>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-1.5 text-sm font-semibold rounded border border-[#30363d] hover:border-gray-400 transition text-gray-200"
          >
            Sign in
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-1.5 text-sm font-semibold rounded bg-[#FF4500] hover:bg-[#e03e00] transition text-white shadow-sm"
          >
            Join free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
              Maharashtra's Live Talent Pipeline
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.05]">
              Get Scouted.<br />
              <span className="text-[#FF4500]">Get Selected.</span><br />
              Get on the Field.
            </h1>

            <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
              Discover live trials, compare nearby clubs with an AI scout, and pitch yourself directly to club managers who decide in one click.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => navigate('/login?role=athlete')}
                className="px-6 py-3.5 rounded bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-orange-950/40 transition"
              >
                I'm an Athlete <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/login?role=manager')}
                className="px-6 py-3.5 rounded border border-[#30363d] hover:border-gray-400 bg-[#161b22] text-gray-200 font-bold text-sm tracking-wide transition"
              >
                I manage a Club
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[#21262d] max-w-md mt-4">
              <div>
                <div className="text-3xl md:text-4xl font-black text-white">{stats.active_clubs}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Active Clubs</div>
              </div>
              <div className="border-l border-[#21262d] pl-6">
                <div className="text-3xl md:text-4xl font-black text-white">{stats.open_trials}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Open Trials</div>
              </div>
              <div className="border-l border-[#21262d] pl-6">
                <div className="text-3xl md:text-4xl font-black text-white">{stats.applications}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Applications</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Trials Widget */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {trials.map((t) => (
              <div 
                key={t.id || t._id} 
                onClick={() => navigate('/login?role=athlete')}
                className="bg-[#161b22] border border-[#30363d] hover:border-[#FF4500] p-5 rounded-lg cursor-pointer transition flex flex-col gap-3 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                      LIVE · {t.activity_type}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{t.applied_count || 1} applied</span>
                </div>

                <h3 className="font-extrabold text-base uppercase text-white group-hover:text-[#FF4500] transition line-clamp-1">
                  {t.title}
                </h3>

                <div className="text-xs text-gray-400 font-medium">
                  {t.club_name}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-[#21262d]">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-500" /> {t.date}</span>
                  <span className="text-gray-300 font-bold">{t.age_group}</span>
                  <span className="text-gray-300 font-semibold">{t.entry_fee}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Feature Highlights */}
        <section className="mt-24 pt-16 border-t border-[#21262d]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
              Built for Grassroots Sport
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight mt-2">
              Everything Between a Talented Kid and the Right Club
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-[#21262d] flex items-center justify-center text-[#FF4500]">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base uppercase tracking-wide">AI Club Advisor</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Compare 2–3 clubs on coaching, grounds, fee transparency and a 12-month career forecast.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-[#21262d] flex items-center justify-center text-[#FF4500]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base uppercase tracking-wide">Verified Pitches</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every athlete pitch carries a verified Indian mobile number and full playing profile.
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-lg flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-[#21262d] flex items-center justify-center text-[#FF4500]">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base uppercase tracking-wide">One-Click Decisions</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Managers shortlist, invite or decline; the athlete's tracker updates within seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Two Portals CTA */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate('/login?role=athlete')}
            className="bg-[#161b22] border border-[#30363d] hover:border-[#FF4500] p-8 rounded-lg cursor-pointer transition flex items-center gap-6 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white group-hover:text-[#FF4500] transition">
                Athlete Portal
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Browse open trials, send direct pitches to clubs, track applications live.
              </p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/login?role=manager')}
            className="bg-[#161b22] border border-[#30363d] hover:border-[#FF4500] p-8 rounded-lg cursor-pointer transition flex items-center gap-6 group"
          >
            <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white group-hover:text-[#FF4500] transition">
                Club Manager Portal
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Publish upcoming trials, review athlete pitches, invite talent in one click.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] bg-[#0b0e14] py-8 text-center text-xs text-gray-500">
        © 2026 SPORTBRIDGE · Maharashtra's Live Sports Talent Pipeline
      </footer>
    </div>
  );
}
