import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, Github, Chrome, CheckCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Signup:', formData);
    setIsLoading(false);
  };

  const handleSocialSignup = (provider) => {
    console.log(`Signup with ${provider}`);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'from-red-500 to-orange-500';
    if (passwordStrength <= 50) return 'from-orange-500 to-yellow-500';
    if (passwordStrength <= 75) return 'from-yellow-500 to-lime-500';
    return 'from-emerald-500 to-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return 'Faible';
    if (passwordStrength <= 50) return 'Moyen';
    if (passwordStrength <= 75) return 'Bon';
    return 'Excellent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden relative flex items-center justify-center p-6">
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Signup Container */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl">
            <Shield className="w-12 h-12 text-purple-400 animate-pulse-glow" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              SpamGuard AI
            </h1>
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin-slow" />
          </div>
          <p className="text-xl text-purple-200/80 font-light">
            Rejoignez-nous et protégez-vous du spam
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-slide-up">
          <h2 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Créer un compte
          </h2>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  required
                  className="w-full px-6 py-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-6 py-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mot de passe
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-6 py-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-300/60">Force du mot de passe</span>
                    <span className={`font-bold ${passwordStrength <= 25 ? 'text-red-400' :
                        passwordStrength <= 50 ? 'text-yellow-400' :
                          passwordStrength <= 75 ? 'text-lime-400' :
                            'text-emerald-400'
                      }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getPasswordStrengthColor()} transition-all duration-500`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirmer le mot de passe
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-6 py-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                className="w-5 h-5 mt-1 rounded-lg border-2 border-purple-500/30 bg-slate-900/50 checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer"
              />
              <label className="text-sm text-purple-200/80 leading-relaxed">
                J'accepte les{' '}
                <a href="#" className="text-purple-300 hover:text-cyan-400 font-semibold transition-colors duration-300">
                  conditions d'utilisation
                </a>
                {' '}et la{' '}
                <a href="#" className="text-purple-300 hover:text-cyan-400 font-semibold transition-colors duration-300">
                  politique de confidentialité
                </a>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 relative overflow-hidden group bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <span className="text-sm text-purple-300/60">OU</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          </div>

          {/* Social Signup */}
          {/*           <div className="space-y-3">
            <button
              onClick={() => handleSocialSignup('google')}
              className="w-full py-4 rounded-2xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <Chrome className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <span>S'inscrire avec Google</span>
            </button>

            <button
              onClick={() => handleSocialSignup('github')}
              className="w-full py-4 rounded-2xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <Github className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <span>S'inscrire avec GitHub</span>
            </button>
          </div> */}

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-purple-200/80">
              Vous avez déjà un compte ?{' '}
              <NavLink to="/login" className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text hover:from-purple-300 hover:to-cyan-300 transition-all duration-300">
               Se connecter
              </NavLink>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-xs text-purple-300/60">Protection avancée</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-xs text-purple-300/60">IA puissante</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-xs text-purple-300/60">100% Gratuit</p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&display=swap');
       
        * {
          font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif;
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

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
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

        .animate-scale-in {
          animation: scale-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}