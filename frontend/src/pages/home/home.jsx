import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Sparkles, Zap, TrendingUp, History, BarChart3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, spamAPI } from '../../services/api';

export default function SpamDetectorApp() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState('detector');
  const [spamHistory, setSpamHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAuthenticated()) {
      navigate('/');
      return;
    }

    // Get current user
    setUser(authAPI.getCurrentUser());

    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);

    // Load initial data
    loadHistory();
    loadStats();
  }, [navigate]);

  const loadHistory = async () => {
    try {
      const data = await spamAPI.getHistory();
      setSpamHistory(data.history || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await spamAPI.getStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError('');

    try {
      const data = await spamAPI.analyze(text);

      setResult({
        isSpam: data.isSpam,
        confidence: data.confidence,
        indicators: data.indicators || [],
        flags: data.flags || {}
      });

      // Reload history and stats after analysis
      loadHistory();
      loadStats();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  const getGradientClass = () => {
    if (!result) return 'from-indigo-600 via-purple-600 to-pink-600';
    return result.isSpam
      ? 'from-red-500 via-orange-500 to-yellow-500'
      : 'from-emerald-500 via-teal-500 to-cyan-500';
  };

  const navItems = [
    { id: 'detector', label: 'Détecteur', icon: Shield },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'history', label: 'Historique', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden relative font-sans">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="text-center py-8 mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl">
            <Shield className="w-10 h-10 text-purple-400 animate-pulse-glow" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              SpamGuard AI
            </h1>
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin-slow" />
          </div>
          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto font-light leading-relaxed">
            Détection intelligente de spam alimentée par l'IA
          </p>
          {user && (
            <p className="text-sm text-purple-300/60 mt-2">
              Bienvenue, {user.name}
            </p>
          )}
        </header>

        {/* Modern Navbar */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/60 border-b border-white/10 mb-12 animate-slide-down">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center justify-center gap-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`
                        relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform
                        flex items-center gap-3 group overflow-hidden
                        ${isActive
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white shadow-2xl shadow-purple-500/50 scale-105'
                          : 'bg-white/5 text-purple-200 hover:bg-white/10 hover:scale-105 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'animate-pulse-glow' : 'group-hover:rotate-12'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-cyan-400/20 animate-pulse-slow" />
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 pb-12">
          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* DETECTOR SECTION */}
          {activeSection === 'detector' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
              {/* Input Card */}
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradientClass()} flex items-center justify-center shadow-lg animate-gradient`}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Analyser le Message</h2>
                </div>

                <div className="relative mb-6">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Écrivez ou collez le message à analyser..."
                    className="w-full h-48 bg-slate-900/50 border-2 border-purple-500/30 rounded-2xl p-6 text-white placeholder-purple-300/40 resize-none focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg backdrop-blur-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-purple-300/60">
                    {text.length} caractères
                  </div>
                </div>

                <button
                  onClick={analyzeText}
                  disabled={!text.trim() || isAnalyzing}
                  className={`w-full py-5 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 relative overflow-hidden group ${
                    !text.trim() || isAnalyzing
                      ? 'bg-slate-700/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:shadow-purple-500/50 hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isAnalyzing ? (
                      <>
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Shield className="w-6 h-6" />
                        Détecter le Spam
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </button>
              </div>

              {/* Result Card */}
              {result && (
                <div className={`bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border-2 ${
                  result.isSpam ? 'border-red-500/40' : 'border-emerald-500/40'
                } shadow-2xl animate-slide-up-delayed`}>
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${
                      result.isSpam
                        ? 'from-red-500 to-orange-500'
                        : 'from-emerald-500 to-cyan-500'
                    } flex items-center justify-center shadow-2xl animate-bounce-slow`}>
                      {result.isSpam ? (
                        <AlertTriangle className="w-10 h-10 text-white" />
                      ) : (
                        <CheckCircle className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-3xl font-black mb-2 ${
                        result.isSpam ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {result.isSpam ? 'SPAM DETECTE' : 'MESSAGE LEGITIME'}
                      </h3>
                      <p className="text-lg text-purple-200/80">
                        Confiance: <span className="font-bold text-white text-2xl">{result.confidence}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-8">
                    <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          result.isSpam
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        } animate-expand`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Indicators */}
                  {result.indicators.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4 text-purple-200">Indicateurs de spam trouvés:</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.indicators.map((indicator, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-full text-red-300 text-sm font-semibold backdrop-blur-sm animate-fade-in"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flags */}
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(result.flags).map(([key, value], idx) => (
                      <div
                        key={key}
                        className={`p-4 rounded-2xl backdrop-blur-sm border ${
                          value
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-slate-800/30 border-slate-700/30'
                        } animate-fade-in`}
                        style={{ animationDelay: `${idx * 0.15}s` }}
                      >
                        <div className={`text-xs font-semibold mb-1 ${
                          value ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </div>
                        <div className="text-lg font-bold">
                          {value ? 'X' : 'V'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATISTICS SECTION */}
          {activeSection === 'stats' && (
            <div className="max-w-5xl mx-auto animate-slide-up">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-purple-200/60 mb-1">Total Analysé</div>
                      <div className="text-4xl font-black text-white">{stats?.total || 0}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-full animate-expand"></div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-red-200/60 mb-1">Spams Détectés</div>
                      <div className="text-4xl font-black text-white">{stats?.spam || 0}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 animate-expand"
                      style={{ width: `${stats?.total > 0 ? (stats.spam / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-emerald-200/60 mb-1">Messages Légitimes</div>
                      <div className="text-4xl font-black text-white">{stats?.legitimate || 0}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-expand"
                      style={{ width: `${stats?.total > 0 ? (stats.legitimate / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-cyan-400" />
                  Analyse Détaillée
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-purple-200">Taux de détection de spam</span>
                      <span className="font-bold text-white">
                        {stats?.spamRate || 0}%
                      </span>
                    </div>
                    <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000 animate-expand"
                        style={{ width: `${stats?.spamRate || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-purple-200">Confiance moyenne</span>
                      <span className="font-bold text-white">
                        {stats?.averageConfidence || 0}%
                      </span>
                    </div>
                    <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full transition-all duration-1000 animate-expand"
                        style={{ width: `${stats?.averageConfidence || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-purple-200">Messages légitimes</span>
                      <span className="font-bold text-white">
                        {stats?.total > 0 ? Math.round((stats.legitimate / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-1000 animate-expand"
                        style={{ width: `${stats?.total > 0 ? (stats.legitimate / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY SECTION */}
          {activeSection === 'history' && (
            <div className="max-w-5xl mx-auto animate-slide-up">
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                  <History className="w-8 h-8 text-cyan-400" />
                  Historique des Analyses
                </h3>
                {spamHistory.length === 0 ? (
                  <div className="text-center py-12 text-purple-300/60">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Aucune analyse effectuée</p>
                    <p className="text-sm mt-2">Commencez par analyser un message</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {spamHistory.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
                          item.isSpam
                            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50'
                            : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                        } animate-fade-in`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              item.isSpam ? 'bg-red-500/20' : 'bg-emerald-500/20'
                            }`}>
                              {item.isSpam ? (
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                              ) : (
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                              )}
                            </div>
                            <div>
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                item.isSpam
                                  ? 'bg-red-500/30 text-red-300'
                                  : 'bg-emerald-500/30 text-emerald-300'
                              }`}>
                                {item.isSpam ? 'SPAM' : 'LEGITIME'}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-purple-300/60">{item.time}</span>
                        </div>
                        <p className="text-base text-white/90 mb-3 leading-relaxed">{item.text}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-purple-200/70">
                            Confiance: <span className="font-bold text-white">{item.confidence}%</span>
                          </div>
                          <div className="h-2 w-32 bg-slate-900/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.isSpam
                                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                              }`}
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&display=swap');

        * {
          font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5)); }
          50% { opacity: 0.8; filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8)); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up-delayed {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-left {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes expand {
          from { width: 0; }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-slide-up-delayed {
          animation: slide-up-delayed 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-slide-left {
          animation: slide-left 0.8s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.6s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-expand {
          animation: expand 1s ease-out forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
