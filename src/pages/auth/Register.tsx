import React, { useState } from 'react';
import { Home, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { t } = useLanguage();
  const { registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }
    try {
      setError('');
      await registerWithEmail(email, password, name);
      navigate('/home');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error creating account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-700 flex flex-col items-center justify-center p-6">
      
      {/* Absolute Header link back to Directory */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-[#1E3A8A] transition-colors">
          <ArrowLeft size={14} /> {t('backToDirectory')}
        </Link>
      </div>

      {/* Registration Card Layout container */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 flex flex-col items-center">
        
        {/* Project Icon Branding */}
        <div className="bg-[#1E3A8A] p-3.5 rounded-xl text-white mb-4 shadow-md shadow-blue-900/10">
          <Home size={28} className="fill-white" />
        </div>
        
        <h1 className="text-2xl font-black text-[#1E3A8A] tracking-wider text-center uppercase">
          {t('createAccount')}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">
          {t('joinDirectory')}
        </p>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl mb-4 text-center tracking-wide leading-relaxed">
            {error}
          </div>
        )}

        {/* Input Interactive Form Section */}
        <form onSubmit={handleRegisterSubmit} className="w-full flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('fullName')}
            </label>
            <div className="relative bg-[#F8FAFC] rounded-lg border border-slate-200 shadow-sm flex items-center px-4 py-2.5 focus-within:border-slate-300">
              <User className="text-slate-400 mr-3" size={16} />
              <input 
                type="text" 
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('emailAddress')}
            </label>
            <div className="relative bg-[#F8FAFC] rounded-lg border border-slate-200 shadow-sm flex items-center px-4 py-2.5 focus-within:border-slate-300">
              <Mail className="text-slate-400 mr-3" size={16} />
              <input 
                type="email" 
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('password')}
            </label>
            <div className="relative bg-[#F8FAFC] rounded-lg border border-slate-200 shadow-sm flex items-center px-4 py-2.5 focus-within:border-slate-300">
              <Lock className="text-slate-400 mr-3" size={16} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('confirmPassword')}
            </label>
            <div className="relative bg-[#F8FAFC] rounded-lg border border-slate-200 shadow-sm flex items-center px-4 py-2.5 focus-within:border-slate-300">
              <Lock className="text-slate-400 mr-3" size={16} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Call to action validation creation wrapper triggers */}
          <button
            type="submit"
            className="w-full bg-[#1E3A8A] hover:bg-[#152960] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all tracking-wide uppercase mt-2"
          >
            {t('registerAsContributor')}
          </button>
        </form>

        {/* Redirection to existing profiles path logic */}
        <div className="mt-6 text-center border-t border-slate-100 pt-6 w-full">
          <p className="text-xs text-slate-400 font-medium">
            {t('hasAccountPrompt')}{' '}
            <Link to="/login" className="text-[#F97316] font-bold hover:underline ml-1">
              {t('logInHere')}
            </Link>
          </p>
        </div>

      </div>
      
      {/* Platform Version Baseline text labels */}
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400/70 mt-6">
        © 2026 {t('unifiedPlatform')}
      </span>
    </div>
  );
}