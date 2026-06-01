import { useState } from 'react';
import { Home, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { t } = useLanguage();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/home');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Google Auth Error');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await loginWithEmail(email, password);
      navigate('/home');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
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

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 flex flex-col items-center">
        
        {/* Core Project Branding */}
        <div className="bg-[#1E3A8A] p-3.5 rounded-xl text-white mb-4 shadow-md shadow-blue-900/10">
          <Home size={28} className="fill-white" />
        </div>
        
        <h1 className="text-2xl font-black text-[#1E3A8A] tracking-wider text-center uppercase">
          {t('brand')} <span className="text-[#F97316]">{t('country')}</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-8">
          {t('tagline')}
        </p>

        {/* Informative Prompt context */}
        <div className="text-center mb-6 bg-[#EFF6FF] border border-blue-100 p-4 rounded-xl">
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            {t('loginPrompt')}
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl mb-4 text-center tracking-wide leading-relaxed">
            {error}
          </div>
        )}

        {/* Input Interactive Form Section */}
        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('emailAddress')}
            </label>
            <div className="relative bg-[#F8FAFC] rounded-lg border border-slate-200 shadow-sm flex items-center px-4 py-2.5 focus-within:border-slate-300">
              <Mail className="text-slate-400 mr-3" size={16} />
              <input 
                type="email" 
                placeholder="yourname@example.com"
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

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-[#1E3A8A] hover:bg-[#152960] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all tracking-wide uppercase mt-2"
          >
            {t('signIn')}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full my-6">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">{t('orSeparator')}</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {/* Main Action Button: Google OAuth SSO Link */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm active:scale-[0.99] transition-all tracking-wide"
        >
          {/* Custom Google SVG Icon Vector */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('continueWithGoogle')}
        </button>

        {/* Footer Toggle Path Options */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6 w-full">
          <p className="text-xs text-slate-400 font-medium">
            {t('noAccountPrompt')}{' '}
            <Link to="/register" className="text-[#F97316] font-bold hover:underline ml-1">
              {t('createOneHere')}
            </Link>
          </p>
        </div>

      </div>
      
      {/* System Legal Notice */}
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400/70 mt-6">
        © 2026 {t('unifiedPlatform')}
      </span>
    </div>
  );
}