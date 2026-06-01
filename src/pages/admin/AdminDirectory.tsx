import { useMemo, useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { DirectoryItem, PlaceOrphanage } from '../../types/orphanage';
import { fuzzyScore } from '../../utils/search';
import { mergePlacesById, loadDefaultCameroonPlaces, textSearchPlaces } from '../../utils/nominatim';
import { useMapSearchSuggestions } from '../../hooks/useMapSearchSuggestions';
import DirectoryFilters from '../../components/admin/DirectoryFilters';
import DirectoryTable from '../../components/admin/DirectoryTable';
import DirectoryMapPanel from '../../components/admin/DirectoryMapPanel';

export default function AdminDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [directoryItems, setDirectoryItems] = useState<DirectoryItem[]>([]);
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [selectedMapItemId, setSelectedMapItemId] = useState<string | null>(null);
  const [defaultOsmPlaces, setDefaultOsmPlaces] = useState<PlaceOrphanage[]>([]);
  const [osmPlaceSearchResults, setOsmPlaceSearchResults] = useState<PlaceOrphanage[]>([]);
  const [loadingOsmPlaces, setLoadingOsmPlaces] = useState(false);
  const [selectedOsmPlaceId, setSelectedOsmPlaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const places = await loadDefaultCameroonPlaces(null);
      if (!cancelled) setDefaultOsmPlaces(places);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmed = mapSearchTerm.trim();
    if (!trimmed) {
      setOsmPlaceSearchResults([]);
      setSelectedOsmPlaceId(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoadingOsmPlaces(true);
      try {
        const q = trimmed.toLowerCase().includes('cameroon') ? trimmed : `${trimmed} Cameroon`;
        const places = await textSearchPlaces(null, q);
        setOsmPlaceSearchResults(places);
      } finally {
        setLoadingOsmPlaces(false);
      }
    }, 380);

    return () => window.clearTimeout(timer);
  }, [mapSearchTerm]);

  const mergedOsmPlacesForMap = useMemo(
    () => mergePlacesById(defaultOsmPlaces, osmPlaceSearchResults),
    [defaultOsmPlaces, osmPlaceSearchResults]
  );

  useEffect(() => {
    const q = query(collection(db, 'orphanages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: DirectoryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            name: data.name || '',
            city: data.city || '',
            region: data.region || '',
            verified: !!data.verified,
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
          });
        });
        setDirectoryItems(fetched);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching directory items:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will permanently remove it from the database.`)) {
      try {
        await deleteDoc(doc(db, 'orphanages', id));
      } catch (err) {
        console.error('Error deleting orphanage:', err);
        alert('Failed to delete the orphanage. Please try again.');
      }
    }
  };

  const toggleVerification = async (id: string, currentVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'orphanages', id), { verified: !currentVerified });
    } catch (err) {
      console.error('Error updating verification status:', err);
      alert('Failed to update verification status.');
    }
  };

  const filteredItems = directoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion =
      selectedRegion === 'All Regions' ||
      item.region.toLowerCase() === selectedRegion.toLowerCase();

    const matchesStatus =
      selectedStatus === 'All Status' ||
      (selectedStatus === 'APPROVED' && item.verified) ||
      (selectedStatus === 'PENDING' && !item.verified);

    return matchesSearch && matchesRegion && matchesStatus;
  });

  const filteredMapItems = useMemo(() => {
    const queryText = mapSearchTerm.trim();
    if (!queryText) return filteredItems;

    return filteredItems.filter((item) => {
      const text = `${item.name} ${item.city} ${item.region}`;
      return fuzzyScore(text, queryText) > 0;
    });
  }, [filteredItems, mapSearchTerm]);

  const getItemSearchText = useCallback(
    (item: DirectoryItem) => `${item.name} ${item.city} ${item.region}`,
    []
  );

  const mapSearchSuggestions = useMapSearchSuggestions(filteredItems, mapSearchTerm, getItemSearchText, 6);

  const handleSelectMapItem = (item: DirectoryItem) => {
    setMapSearchTerm(item.name);
    setSelectedMapItemId(item.id);
    setSelectedOsmPlaceId(null);
  };

  const handleSelectOsmPlace = (place: PlaceOrphanage) => {
    setSelectedOsmPlaceId(place.id);
    setSelectedMapItemId(null);
  };

  const handleMapOsmPlaceIdChange = useCallback((id: string | null) => {
    setSelectedOsmPlaceId(id);
    if (id !== null) setSelectedMapItemId(null);
  }, []);

  const handleMapSearchChange = (term: string) => {
    setMapSearchTerm(term);
    setSelectedMapItemId(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-slate-400">
        <Loader2 className="animate-spin text-[#1E3A8A] mr-2" size={24} />
        <span>Loading complete directory...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#1E3A8A]">Complete Directory</h2>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
            Manage and Filter Verified Institutions
          </p>
        </div>

        <DirectoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredItems.length}
        />
      </div>

      {viewMode === 'table' && (
        <DirectoryTable
          items={filteredItems}
          onToggleVerification={toggleVerification}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'map' && (
        <DirectoryMapPanel
          mapSearchTerm={mapSearchTerm}
          onMapSearchChange={handleMapSearchChange}
          mapSearchSuggestions={mapSearchSuggestions}
          selectedMapItemId={selectedMapItemId}
          onSelectItem={handleSelectMapItem}
          filteredMapItems={filteredMapItems}
          loading={loading}
          osmSearchResults={osmPlaceSearchResults}
          loadingOsmPlaces={loadingOsmPlaces}
          selectedOsmPlaceId={selectedOsmPlaceId}
          onSelectOsmPlace={handleSelectOsmPlace}
          onOsmPlaceIdFromMap={handleMapOsmPlaceIdChange}
          mergedOsmPlaces={mergedOsmPlacesForMap}
        />
      )}
    </main>
  );
}
