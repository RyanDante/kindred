import { MapPin } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import GoogleMapPicker from '../maps/GoogleMapPicker';
import FormSection from '../ui/FormSection';

interface LocationSectionProps {
  latitude: string;
  longitude: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export default function LocationSection({
  latitude,
  longitude,
  onInputChange,
  onLocationChange,
  disabled,
}: LocationSectionProps) {
  const { t } = useLanguage();

  return (
    <FormSection icon={MapPin} title={t('locationGps')}>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Click on map to set location
        </label>
        <GoogleMapPicker
          latitude={parseFloat(latitude) || 0}
          longitude={parseFloat(longitude) || 0}
          onLocationChange={onLocationChange}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('latitude')} <span className="text-slate-400/80">*</span>
          </label>
          <input
            type="text"
            name="latitude"
            placeholder="e.g. 3.848"
            value={latitude}
            onChange={onInputChange}
            required
            disabled={disabled}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 placeholder-slate-400 disabled:opacity-65"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('longitude')} <span className="text-slate-400/80">*</span>
          </label>
          <input
            type="text"
            name="longitude"
            placeholder="e.g. 11.502"
            value={longitude}
            onChange={onInputChange}
            required
            disabled={disabled}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-300 placeholder-slate-400 disabled:opacity-65"
          />
        </div>
      </div>
    </FormSection>
  );
}
