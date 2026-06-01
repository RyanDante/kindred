import { Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CAMEROON_REGIONS } from '../../constants/regions';
import FormSection from '../ui/FormSection';

interface BasicInfoSectionProps {
  formData: { name: string; region: string; city: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
}

export default function BasicInfoSection({ formData, onChange, disabled }: BasicInfoSectionProps) {
  const { t } = useLanguage();

  return (
    <FormSection icon={Info} title={t('basicInfo')}>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t('orphanageName')} <span className="text-slate-400/80">*</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Hope Village"
          value={formData.name}
          onChange={onChange}
          required
          disabled={disabled}
          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 placeholder-slate-400 disabled:opacity-65"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('region')} <span className="text-slate-400/80">*</span>
          </label>
          <div className="relative">
            <select
              name="region"
              value={formData.region}
              onChange={onChange}
              disabled={disabled}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 appearance-none cursor-pointer disabled:opacity-65"
            >
              {CAMEROON_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('city')} <span className="text-slate-400/80">*</span>
          </label>
          <input
            type="text"
            name="city"
            placeholder="e.g. Yaoundé"
            value={formData.city}
            onChange={onChange}
            required
            disabled={disabled}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 placeholder-slate-400 disabled:opacity-65"
          />
        </div>
      </div>
    </FormSection>
  );
}
