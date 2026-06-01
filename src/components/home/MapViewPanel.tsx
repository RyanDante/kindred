import { Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Orphanage } from '../../types/orphanage';
import OrphanagesGoogleMap from '../maps/OrphanagesGoogleMap';
import MapSearchSuggestions from '../ui/MapSearchSuggestions';

interface MapViewPanelProps {
  mapSearchQuery: string;
  onMapSearchChange: (query: string) => void;
  mapSearchSuggestions: Orphanage[];
  selectedMapOrphanageId: string | null;
  onSelectOrphanage: (orphanage: Orphanage) => void;
  filteredMapOrphanages: Orphanage[];
  loading: boolean;
}

export default function MapViewPanel({
  mapSearchQuery,
  onMapSearchChange,
  mapSearchSuggestions,
  selectedMapOrphanageId,
  onSelectOrphanage,
  filteredMapOrphanages,
  loading,
}: MapViewPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 bg-[#E2E8F0]/40 rounded-xl border border-slate-200 relative flex flex-col p-4 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 w-72">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex items-center pr-0 overflow-hidden">
          <input
            type="text"
            placeholder={t('searchLocation')}
            value={mapSearchQuery}
            onChange={(e) => onMapSearchChange(e.target.value)}
            className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none pl-4 py-2.5 placeholder-slate-400"
          />
          <button
            type="button"
            className="bg-[#1E3A8A] text-white p-2.5 flex items-center justify-center hover:bg-[#152960] transition-colors cursor-pointer"
          >
            <Search size={14} />
          </button>
        </div>
        <MapSearchSuggestions
          suggestions={mapSearchSuggestions}
          onSelect={onSelectOrphanage}
          getSubtitle={(orphanage) => `${orphanage.city}, ${orphanage.region}`}
        />
      </div>

      <OrphanagesGoogleMap
        orphanages={filteredMapOrphanages}
        loading={loading}
        selectedOrphanageId={selectedMapOrphanageId}
      />
    </div>
  );
}
