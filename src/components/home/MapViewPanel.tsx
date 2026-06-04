import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Orphanage } from '../../types/orphanage';
import LeafletOrphanageMap from '../maps/LeafletOrphanageMap';
import MapSearchSuggestions from '../ui/MapSearchSuggestions';

interface MapViewPanelProps {
  mapSearchQuery: string;
  onMapSearchChange: (query: string) => void;
  mapSearchSuggestions: Orphanage[];
  selectedMapOrphanageId: string | null;
  onSelectOrphanage: (orphanage: Orphanage) => void;
  mapOrphanages: Orphanage[];
  loading: boolean;
}

export default function MapViewPanel({
  mapSearchQuery,
  onMapSearchChange,
  mapSearchSuggestions,
  selectedMapOrphanageId,
  onSelectOrphanage,
  mapOrphanages,
  loading,
}: MapViewPanelProps) {
  const { t } = useLanguage();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShowSuggestions(mapSearchSuggestions.length > 0 && mapSearchQuery.trim().length > 0);
  }, [mapSearchSuggestions, mapSearchQuery]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!suggestionRef.current?.contains(target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleInputChange = (value: string) => {
    onMapSearchChange(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSuggestionSelect = (orphanage: Orphanage) => {
    onSelectOrphanage(orphanage);
    setShowSuggestions(false);
  };

  return (
    <div className="flex-1 min-h-[320px] md:min-h-[520px] bg-[#E2E8F0]/40 rounded-xl border border-slate-200 relative flex flex-col p-4 overflow-hidden">
      <div ref={suggestionRef} className="absolute inset-x-4 top-4 z-10 mx-auto max-w-[40rem] px-2 sm:px-0">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex items-center pr-0 overflow-hidden">
          <input
            type="text"
            placeholder={t('searchLocation')}
            value={mapSearchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(mapSearchSuggestions.length > 0)}
            className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none pl-4 py-2.5 placeholder-slate-400"
          />
          <button
            type="button"
            className="bg-[#1E3A8A] text-white p-2.5 flex items-center justify-center hover:bg-[#152960] transition-colors cursor-pointer"
          >
            <Search size={14} />
          </button>
        </div>
        {showSuggestions && (
          <MapSearchSuggestions
            suggestions={mapSearchSuggestions}
            onSelect={handleSuggestionSelect}
            getSubtitle={(orphanage) => `${orphanage.city}, ${orphanage.region}`}
          />
        )}
      </div>

      <LeafletOrphanageMap
        orphanages={mapOrphanages}
        loading={loading}
        selectedOrphanageId={selectedMapOrphanageId}
      />
    </div>
  );
}
