import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

export default function MapLockedPrompt() {
  const { language, t } = useLanguage();

  return (
    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-8 select-none text-center shadow-inner">
      <div className="w-16 h-16 bg-[#EFF6FF] text-[#1E3A8A] rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <Lock size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {language === 'fr' ? 'Accès Restreint à la Carte' : 'Map View Restricted'}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm tracking-wide leading-relaxed mb-6">
        {language === 'fr'
          ? 'Pour explorer les cartes interactives et géolocaliser les institutions, veuillez créer un compte ou vous connecter.'
          : 'To explore interactive maps and geolocate care institutions, please create a free contributor account or sign in.'}
      </p>
      <div className="flex items-center gap-4 justify-center">
        <Link
          to="/login"
          className="bg-[#1E3A8A] hover:bg-[#152960] text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-colors uppercase tracking-wider"
        >
          {t('signIn')}
        </Link>
        <Link
          to="/register"
          className="bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-colors uppercase tracking-wider"
        >
          {t('createAccount')}
        </Link>
      </div>
    </div>
  );
}
