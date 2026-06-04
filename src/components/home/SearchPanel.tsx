import { Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Orphanage } from '../../types/orphanage';
import SearchInput from '../ui/SearchInput';
import RegionFilterBadges from '../ui/RegionFilterBadges';
import SelectDropdown from '../ui/SelectDropdown';
import LoadingIndicator from '../ui/LoadingIndicator';
import OrphanageCard from '../OrphanageCard';

interface SearchPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  minCapacity: number;
  onMinCapacityChange: (capacity: number) => void;
  filteredOrphanages: Orphanage[];
  loading: boolean;
}

export default function SearchPanel({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  minCapacity,
  onMinCapacityChange,
  filteredOrphanages,
  loading,
}: SearchPanelProps) {
  const { language, t } = useLanguage();
  const childrenLabel = language === 'fr' ? 'Enfants' : 'Children';

  const capacityOptions = [
    { value: 0, label: t('minCapacity') },
    { value: 10, label: `10+ ${childrenLabel}` },
    { value: 30, label: `30+ ${childrenLabel}` },
    { value: 50, label: `50+ ${childrenLabel}` },
    { value: 100, label: `100+ ${childrenLabel}` },
  ];

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-hidden">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={t('searchPlaceholder')}
      />

      <RegionFilterBadges
        selectedRegion={selectedRegion}
        onSelect={onRegionChange}
        allLabel={t('allRegions')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectDropdown
          value={minCapacity}
          onChange={(val) => onMinCapacityChange(Number(val))}
          options={capacityOptions}
        />
        <SelectDropdown
          value=""
          onChange={() => {}}
          options={[{ value: '', label: t('anyAgeGroup') }]}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400/80 px-1 shrink-0">
          <span>
            {filteredOrphanages.length}{' '}
            {filteredOrphanages.length === 1 ? 'Institution' : 'Institutions'}
          </span>
          {selectedRegion !== 'All Regions' && (
            <span className="text-orange-500 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-100">
              {selectedRegion}
            </span>
          )}
        </div>

        {loading ? (
          <LoadingIndicator message="Syncing with live directory..." />
        ) : filteredOrphanages.length > 0 ? (
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 gap-6 md:grid-cols-2 pb-6 select-none">
            {filteredOrphanages.map((orphanage) => (
              <OrphanageCard key={orphanage.id} orphanage={orphanage} />
            ))}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
              <Search size={24} />
            </div>
            <p className="text-slate-500 text-sm font-semibold max-w-xs px-6 leading-relaxed">
              {t('noResults')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
