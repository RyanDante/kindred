import { Phone, Camera } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import FormSection from '../ui/FormSection';

interface ContactDetailsSectionProps {
  formData: {
    phone: string;
    email: string;
    capacity: string;
    description: string;
    photo: File | null;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function ContactDetailsSection({
  formData,
  onInputChange,
  onFileChange,
  disabled,
}: ContactDetailsSectionProps) {
  const { t } = useLanguage();

  return (
    <FormSection icon={Phone} title={t('contactDetails')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('contactPhone')}
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            disabled={disabled}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 disabled:opacity-65"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('email')}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            disabled={disabled}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 disabled:opacity-65"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('capacity')}
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={onInputChange}
            disabled={disabled}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 disabled:opacity-65"
          />
        </div>

        <div className="flex flex-col gap-1 h-full">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('photo')} <span className="text-slate-400/80">*</span>
          </label>
          <label className="flex-1 min-h-[110px] bg-[#F8FAFC] border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors p-4 relative overflow-hidden disabled:opacity-65">
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              required={!formData.photo}
              disabled={disabled}
              className="hidden"
            />
            {formData.photo ? (
              <div className="text-center">
                <p className="text-xs font-semibold text-emerald-600">{t('selectedFile')}</p>
                <p className="text-xs text-slate-500 max-w-[200px] truncate">{formData.photo.name}</p>
              </div>
            ) : (
              <>
                <Camera size={20} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('clickToUploadPhoto')}
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t('description')}
        </label>
        <textarea
          name="description"
          rows={5}
          value={formData.description}
          onChange={onInputChange}
          disabled={disabled}
          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 resize-y min-h-[120px] disabled:opacity-65"
        />
      </div>
    </FormSection>
  );
}
