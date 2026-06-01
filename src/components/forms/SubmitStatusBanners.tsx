import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface SubmitStatusBannersProps {
  submitSuccess: boolean;
  submitError: string;
}

export default function SubmitStatusBanners({ submitSuccess, submitError }: SubmitStatusBannersProps) {
  const { t } = useLanguage();

  return (
    <>
      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-800 animate-fadeIn">
          <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm font-medium">{t('submitSuccess')}</div>
        </div>
      )}

      {submitError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 animate-fadeIn">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm font-medium">
            {t('submitError')}
            <span className="block text-xs text-rose-500 font-normal mt-1">{submitError}</span>
          </div>
        </div>
      )}
    </>
  );
}
