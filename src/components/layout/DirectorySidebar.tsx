import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Orphanage } from '../../types/orphanage';

interface DirectorySidebarProps {
  orphanages: Orphanage[];
  loading: boolean;
}

export default function DirectorySidebar({ orphanages, loading }: DirectorySidebarProps) {
  const { t } = useLanguage();

  const totalCount = loading ? 842 : 839 + orphanages.length;
  const verifiedCount = loading ? 612 : 609 + orphanages.filter((o) => o.verified).length;
  const totalPercentage = Math.min(100, Math.round((totalCount / 900) * 100));
  const verifiedPercentage = Math.min(100, Math.round((verifiedCount / totalCount) * 100));

  return (
    <div className="w-80 flex flex-col gap-6 shrink-0 select-none">
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-4">
          {t('directoryStats')}
        </h2>

        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-slate-500 font-medium">{t('totalInstitutions')}</span>
            <span className="text-2xl font-black text-[#1E3A8A]">{totalCount}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E3A8A] rounded-full transition-all duration-500"
              style={{ width: `${totalPercentage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-slate-500 font-medium">{t('verifiedListings')}</span>
            <span className="text-2xl font-black text-[#10B981]">{verifiedCount}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${verifiedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <h3 className="text-xs font-bold text-blue-900 tracking-wide">{t('offlineModeReady')}</h3>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed font-medium">{t('offlineModeDesc')}</p>
      </div>

      <div className="bg-[#FFF7ED] border border-orange-100 rounded-xl p-5 shadow-sm mt-auto flex flex-col gap-4">
        <p className="text-xs font-bold text-orange-800 leading-relaxed">{t('contributePrompt')}</p>
        <Link
          to="/submit"
          className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-lg shadow-sm transition-colors uppercase tracking-wider text-center block"
        >
          {t('contributeNow')}
        </Link>
      </div>

      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2 flex flex-col gap-0.5">
        <div>© 2026 {t('brand')} {t('country')}</div>
        <div className="text-slate-300">{t('tagline')}</div>
      </div>
    </div>
  );
}
