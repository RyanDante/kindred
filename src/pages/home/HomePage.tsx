import { useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrphanages } from '../../hooks/useOrphanages';
import { useMapSearchSuggestions } from '../../hooks/useMapSearchSuggestions';
import { ALL_REGIONS_OPTION } from '../../constants/regions';
import { fuzzyScore } from '../../utils/search';
import AppHeader from '../../components/layout/AppHeader';
import DirectorySidebar from '../../components/layout/DirectorySidebar';
import FloatingSubmitButton from '../../components/layout/FloatingSubmitButton';
import SearchPanel from '../../components/home/SearchPanel';
import MapViewPanel from '../../components/home/MapViewPanel';
import MapLockedPrompt from '../../components/home/MapLockedPrompt';

export default function HomePage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'search' | 'map'>('search');
  const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS_OPTION);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [selectedMapOrphanageId, setSelectedMapOrphanageId] = useState<string | null>(null);
  const [minCapacity, setMinCapacity] = useState<number>(0);

  const { orphanages, loading: loadingListings } = useOrphanages({ autoSeed: true });

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

  const filteredMapOrphanages = useMemo(() => {
    const query = mapSearchQuery.trim();
    if (!query) return filteredOrphanages;

    return filteredOrphanages.filter((orphanage) => {
      const text = `${orphanage.name} ${orphanage.city} ${orphanage.region} ${orphanage.description}`;
      return fuzzyScore(text, query) > 0;
    });
  }, [filteredOrphanages, mapSearchQuery]);

  const getOrphanageSearchText = useCallback(
    (orphanage: (typeof filteredOrphanages)[0]) =>
      `${orphanage.name} ${orphanage.city} ${orphanage.region} ${orphanage.description}`,
    []
  );

  const mapSearchSuggestions = useMapSearchSuggestions(
    filteredOrphanages,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-700 flex flex-col">
      <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />

      <div className="flex-1 flex p-6 gap-6 max-w-[1600px] w-full mx-auto">
        {viewMode === 'search' ? (
          <SearchPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            minCapacity={minCapacity}
            onMinCapacityChange={setMinCapacity}
            filteredOrphanages={filteredOrphanages}
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
            filteredMapOrphanages={filteredMapOrphanages}
            loading={loadingListings}
          />
        )}

        <DirectorySidebar orphanages={orphanages} loading={loadingListings} />
      </div>

      <FloatingSubmitButton />
    </div>
  );
}
