import { useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrphanages } from '../../hooks/useOrphanages';
import { useMapSearchSuggestions } from '../../hooks/useMapSearchSuggestions';
import { useLanguage } from '../../i18n/LanguageContext';
import { ALL_REGIONS_OPTION } from '../../constants/regions';
import { fuzzyScore } from '../../utils/search';
import AppHeader from '../../components/layout/AppHeader';
import DirectorySidebar from '../../components/layout/DirectorySidebar';
import FloatingSubmitButton from '../../components/layout/FloatingSubmitButton';
import BottomNav from '../../components/layout/BottomNav';
import SearchPanel from '../../components/home/SearchPanel';
import MapViewPanel from '../../components/home/MapViewPanel';
import MapLockedPrompt from '../../components/home/MapLockedPrompt';
import { useFavorites } from '../../hooks/useFavorites';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'search' | 'map'>('search');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS_OPTION);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [selectedMapOrphanageId, setSelectedMapOrphanageId] = useState<string | null>(null);
  const [minCapacity, setMinCapacity] = useState<number>(0);

  const { orphanages, loading: loadingListings } = useOrphanages({ autoSeed: true });
  const { favoriteIds, toggleFavorite } = useFavorites(user?.uid);

  const filteredOrphanages = orphanages.filter((orphanage) => {
    if (!orphanage.verified) return false;

    const matchesSearch =
      orphanage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orphanage.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orphanage.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === ALL_REGIONS_OPTION || orphanage.region === selectedRegion;

    const matchesCapacity = orphanage.capacity >= minCapacity;

    return matchesSearch && matchesRegion && matchesCapacity;
  });

  const mapOrphanages = useMemo(() => {
    const query = mapSearchQuery.trim();
    if (!query) return orphanages;

    return orphanages.filter((orphanage) => {
      const text = `${orphanage.name} ${orphanage.city} ${orphanage.region} ${orphanage.description}`;
      return fuzzyScore(text, query) > 0;
    });
  }, [orphanages, mapSearchQuery]);

  const getOrphanageSearchText = useCallback(
    (orphanage: (typeof orphanages)[0]) =>
      `${orphanage.name} ${orphanage.city} ${orphanage.region} ${orphanage.description}`,
    []
  );

  const mapSearchSuggestions = useMapSearchSuggestions(
    mapOrphanages,
    mapSearchQuery,
    getOrphanageSearchText,
    5
  );

  const handleSelectMapOrphanage = (orphanage: (typeof filteredOrphanages)[0]) => {
    setMapSearchQuery(orphanage.name);
    setSelectedMapOrphanageId(orphanage.id);
  };

  const handleMapSearchChange = (query: string) => {
    setMapSearchQuery(query);
    setSelectedMapOrphanageId(null);
  };

  const handleToggleFavorite = (orphanage: (typeof filteredOrphanages)[0]) => {
    toggleFavorite(orphanage.id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-700 flex flex-col">
      <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setSidebarVisible((visible) => !visible)}
          >
            {sidebarVisible ? t('hidePanel') : t('showPanel')}
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 flex flex-col gap-6">
            {viewMode === 'search' ? (
              <SearchPanel
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                minCapacity={minCapacity}
                onMinCapacityChange={setMinCapacity}
                filteredOrphanages={filteredOrphanages}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                loading={loadingListings}
              />
            ) : !user ? (
              <MapLockedPrompt />
            ) : (
              <MapViewPanel
                mapSearchQuery={mapSearchQuery}
                onMapSearchChange={handleMapSearchChange}
                mapSearchSuggestions={mapSearchSuggestions}
                selectedMapOrphanageId={selectedMapOrphanageId}
                onSelectOrphanage={handleSelectMapOrphanage}
                mapOrphanages={mapOrphanages}
                loading={loadingListings}
              />
            )}
          </div>

          {sidebarVisible && (
            <div className="w-full lg:w-80 flex-shrink-0">
              <DirectorySidebar orphanages={orphanages} />
            </div>
          )}
        </div>
      </div>

      <FloatingSubmitButton />
      <BottomNav />
    </div>
  );
}
