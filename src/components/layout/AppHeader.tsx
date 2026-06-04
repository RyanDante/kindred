import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  viewMode: 'search' | 'map';
  onViewModeChange: (mode: 'search' | 'map') => void;
}

export default function AppHeader({ viewMode, onViewModeChange }: AppHeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#1E3A8A] text-white px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <div className="bg-white p-2 rounded text-[#1E3A8A]">
          <Home size={20} className="fill-[#1E3A8A]" />
        </div>
        <span className="text-xl font-bold tracking-wide">
          {t('brand')} <span className="underline decoration-2 underline-offset-4 text-slate-300">{t('country')}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold tracking-wider">
        <button
          type="button"
          onClick={() => onViewModeChange('search')}
          className={`transition-colors decoration-2 underline-offset-4 cursor-pointer ${
            viewMode === 'search' ? 'text-orange-400 underline' : 'text-slate-200 hover:text-white'
          }`}
        >
          {t('searchOrphanages')}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('map')}
          className={`transition-colors decoration-2 underline-offset-4 cursor-pointer ${
            viewMode === 'map' ? 'text-orange-400 underline' : 'text-slate-200 hover:text-white'
          }`}
        >
          {t('viewOnMap')}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-white/10 rounded overflow-hidden p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`${language === 'en' ? 'bg-white text-slate-900' : 'text-slate-300'} px-2.5 py-1 rounded-sm transition-colors cursor-pointer`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('fr')}
            className={`${language === 'fr' ? 'bg-white text-slate-900' : 'text-slate-300'} px-2.5 py-1 rounded-sm transition-colors cursor-pointer`}
          >
            FR
          </button>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-orange-400 font-extrabold">
                {language === 'fr' ? 'Contributeur' : 'Contributor'}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded border border-white/20 hover:border-white/30 transition-all select-none cursor-pointer"
            >
              {t('logout')}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded shadow transition-all block text-center"
          >
            {t('loginWithGoogle')}
          </Link>
        )}
      </div>
    </header>
  );
}
