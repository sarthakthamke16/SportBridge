import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Zap, Eye, EyeOff, Award, Building2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'manager' ? 'manager' : 'athlete';
  
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e, customEmail = null, customPassword = null, customRole = null) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPw = customPassword || password;
    const loginRole = customRole || role;

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: loginEmail,
        password: loginPw,
        role: loginRole
      });

      const { token, user } = res.data;
      localStorage.setItem('sb_token', token);
      localStorage.setItem('sb_role', user.role);
      localStorage.setItem('sb_user', JSON.stringify(user));

      if (user.role === 'manager' || user.role === 'owner') {
        navigate('/manager');
      } else {
        navigate('/athlete');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAthlete = () => {
    setRole('athlete');
    setEmail('demo_athlete@sportbridge.in');
    setPassword('Demo@1234');
    handleLogin(null, 'demo_athlete@sportbridge.in', 'Demo@1234', 'athlete');
  };

  const handleDemoManager = () => {
    setRole('manager');
    setEmail('demo_manager@sportbridge.in');
    setPassword('Demo@1234');
    handleLogin(null, 'demo_manager@sportbridge.in', 'Demo@1234', 'manager');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col md:flex-row font-sans selection:bg-[#FF4500] selection:text-white">
      {/* Left Banner / Photo Side */}
      <div className="md:w-1/2 relative bg-[#0b0e14] border-r border-[#21262d] flex flex-col justify-between p-8 md:p-12 overflow-hidden min-h-[300px] md:min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 filter grayscale contrast-125 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1400&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded bg-[#FF4500] flex items-center justify-center font-black">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight uppercase">SportBridge</span>
        </div>

        <div className="relative z-10 my-auto py-12">
          <span className="text-[#FF4500] text-xs font-black tracking-widest uppercase">
            SportBridge
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-2 leading-none">
            Your Next Trial<br />
            Is One Pitch Away
          </h2>
        </div>

        <div className="relative z-10 text-xs text-gray-500">
          Maharashtra's Live Sports Talent Pipeline · Pune & Kolhapur Hub
        </div>
      </div>

      {/* Right Form Side */}
      <div className="md:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 bg-[#0d1117]">
        <div className="w-full max-w-md mx-auto">

          {/* Quick Demo Login Bar */}
          <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg mb-8">
            <div className="text-[11px] font-bold text-[#FF4500] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-ping inline-block"></span>
              Quick Demo Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoAthlete}
                className="text-xs bg-[#21262d] hover:bg-[#30363d] text-gray-200 font-semibold py-2 px-3 rounded text-center transition"
              >
                Demo Athlete Login
              </button>
              <button
                type="button"
                onClick={handleDemoManager}
                className="text-xs bg-[#21262d] hover:bg-[#30363d] text-gray-200 font-semibold py-2 px-3 rounded text-center transition"
              >
                Demo Manager Login
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-xs mt-1 mb-6">Pick your role, then sign in.</p>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('athlete')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded font-bold text-xs uppercase tracking-wide transition border ${
                role === 'athlete'
                  ? 'bg-[#FF4500] border-[#FF4500] text-white shadow-md'
                  : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Sign in as Athlete
            </button>
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded font-bold text-xs uppercase tracking-wide transition border ${
                role === 'manager'
                  ? 'bg-[#FF4500] border-[#FF4500] text-white shadow-md'
                  : 'bg-[#161b22] border-[#30363d] text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Sign in as Club Manager
            </button>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-xs p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@sportbridge.in"
                className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] rounded px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[11px] text-gray-500 hover:text-gray-300">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] rounded px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold py-3 px-4 rounded text-sm uppercase tracking-wide transition shadow-lg shadow-orange-950/40 mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Social or divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#21262d]"></div>
            </div>
            <span className="relative bg-[#0d1117] px-3 text-[11px] text-gray-500 uppercase">or</span>
          </div>

          <button 
            type="button"
            onClick={role === 'athlete' ? handleDemoAthlete : handleDemoManager}
            className="w-full bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-200 font-semibold py-2.5 px-4 rounded text-xs flex items-center justify-center gap-2 transition"
          >
            <span className="text-sm font-bold text-blue-400">G</span> Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
