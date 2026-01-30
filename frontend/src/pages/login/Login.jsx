import React, { useState, useEffect } from 'react';
import { Mail, Lock, Apple, Chrome } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function ModernLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gridLines, setGridLines] = useState([]);

  useEffect(() => {
    // Generate animated grid lines
    const lines = [];
    for (let i = 0; i < 6; i++) {
      lines.push({
        id: i,
        delay: i * 0.3,
        duration: 3 + Math.random() * 2
      });
    }
    setGridLines(lines);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
   
    await new Promise(resolve => setTimeout(resolve, 2000));
   
    console.log('Login:', { email, password });
    setIsLoading(false);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  const XIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center p-6">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {/* Vertical lines */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"
            style={{
              left: `${(i + 1) * 5}%`,
              animation: `shimmer ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        {/* Horizontal lines */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
            style={{
              top: `${(i + 1) * 6.66}%`,
              animation: `shimmer ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>

      {/* Geometric Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Corner */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-30">
          <div className="absolute top-12 left-12 w-32 h-32 border border-cyan-500/40 rounded-lg animate-float-slow" />
          <div className="absolute top-20 left-20 w-24 h-24 border border-cyan-400/30 rounded-lg animate-float-slow" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Top Right Corner */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-30">
          <div className="absolute top-12 right-12 w-40 h-40 border border-cyan-500/40 animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-16 right-16 w-32 h-32 border border-cyan-400/30 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-20">
          <div className="absolute bottom-10 left-10 w-24 h-24 border-l border-t border-cyan-500/50 animate-pulse-glow" />
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-20">
          <div className="absolute bottom-10 right-10 w-24 h-24 border-r border-b border-cyan-500/50 animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Card with glass effect */}
        <div className="relative bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-2xl rounded-3xl p-10 border border-gray-800/50 shadow-2xl overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
         
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin-slow" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse-slow" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm">
              Don't have an account yet?{' '}
              <NavLink to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300">
                Sign up
              </NavLink>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 mb-8">
            {/* Email Input */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email address"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-black/70 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-black/70 transition-all duration-300"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div> */}

          {/* Social Login Buttons */}
          {/* <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => handleSocialLogin('apple')}
              className="py-3.5 bg-black/50 border border-gray-800 rounded-xl hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-300 flex items-center justify-center group"
            >
              <Apple className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </button>

            <button
              onClick={() => handleSocialLogin('google')}
              className="py-3.5 bg-black/50 border border-gray-800 rounded-xl hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-300 flex items-center justify-center group"
            >
              <Chrome className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </button>

            <button
              onClick={() => handleSocialLogin('x')}
              className="py-3.5 bg-black/50 border border-gray-800 rounded-xl hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-300 flex items-center justify-center group"
            >
              <div className="text-gray-400 group-hover:text-white transition-colors duration-300">
                <XIcon />
              </div>
            </button>
          </div> */}
        </div>

        {/* Floating particles around card */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border border-cyan-500/30 rounded-full animate-ping-slow" />
        <div className="absolute -bottom-4 -right-4 w-6 h-6 border border-blue-500/30 rounded-full animate-ping-slow" style={{ animationDelay: '1s' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
       
        * {
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { opacity: 0.4; box-shadow: 0 0 40px rgba(6, 182, 212, 0.5); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out forwards;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}