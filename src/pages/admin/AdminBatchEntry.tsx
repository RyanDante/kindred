import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Info,
  Trash2,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { db } from '../../firebase/config';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import type { BatchPin, PlaceOrphanage, Orphanage } from '../../types/orphanage';
import { CAMEROON_BOUNDS, defaultCenter } from '../../constants/maps';
import { fuzzyScore, deriveAddressParts } from '../../utils/search';
import LoadingScreen from '../../components/LoadingScreen';

type GoogleMapInstance = object;
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry?: {
    location?: {
      lat?: () => number;
      lng?: () => number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
}
interface GoogleMapsPlacesService {
  textSearch: (
    request: { query: string; location: { lat: number; lng: number }; radius: number; type: string[] },
    callback: (results: GooglePlaceResult[] | null, status: string) => void
  ) => void;
  nearbySearch: (
    request: { location: { lat: number; lng: number }; radius: number; keyword: string },
    callback: (results: GooglePlaceResult[] | null, status: string) => void
  ) => void;
}
type GoogleMapsWindow = { google?: { maps?: { places?: { PlacesService: new (map: GoogleMapInstance) => GoogleMapsPlacesService } } } };

const createBatchPin = (lat: number, lng: number): BatchPin => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: 'New institution',
  region: 'Central',
  city: '',
  latitude: lat,
  longitude: lng,
  phone: '',
  email: '',
  capacity: 0,
  description: '',
  photo: '',
  verified: false,
});

const createBatchPinFromPlace = (place: PlaceOrphanage): BatchPin => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: place.name,
  region: place.region || 'Cameroon',
  city: place.city || 'Cameroon',
  latitude: place.latitude,
  longitude: place.longitude,
  phone: place.phone || '',
  email: '',
  capacity: 0,
  description: place.address,
  photo: '',
  verified: false,
});

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function AdminBatchEntry() {
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [stagedPins, setStagedPins] = useState<BatchPin[]>([]);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [orphanages, setOrphanages] = useState<Orphanage[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null);
  const [placeOrphanages, setPlaceOrphanages] = useState<PlaceOrphanage[]>([]);
  const [placeSearchResults, setPlaceSearchResults] = useState<PlaceOrphanage[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [loadingOrphanages, setLoadingOrphanages] = useState(true);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customName, setCustomName] = useState('');
  const mapRef = useRef<GoogleMapInstance | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    const q = query(collection(db, 'orphanages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Orphanage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude !== undefined && data.longitude !== undefined) {
          fetched.push({
            id: doc.id,
            name: data.name || 'Unnamed',
            region: data.region || 'Central',
            city: data.city || 'Unknown',
            latitude: data.latitude,
            longitude: data.longitude,
            capacity: data.capacity || 0,
            phone: data.phone || '',
            email: data.email || '',
            description: data.description || '',
            photo: data.photo || '',
            verified: !!data.verified,
          });
        }
      });
      setOrphanages(fetched);
      setLoadingOrphanages(false);
    }, (err) => {
      console.error('Failed to load orphanages for batch entry:', err);
      setLoadingOrphanages(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => setStatusMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const loadGooglePlaces = useCallback((map: GoogleMapInstance) => {
    const googleMaps = (window as unknown as GoogleMapsWindow).google;
    if (!googleMaps?.maps?.places) return;

    const service = new googleMaps.maps.places.PlacesService(map);
    const request = {
      query: 'orphanage in Cameroon',
      location: defaultCenter,
      radius: 1200000,
      type: ['establishment'],
    };

    service.textSearch(request, (results: GooglePlaceResult[] | null, status: string) => {
      if (status !== 'OK' || !results) return;

      setPlaceOrphanages(results.map((place) => {
        const address = place.formatted_address || place.vicinity || 'Cameroon';
        const { city, region } = deriveAddressParts(address);

        return {
          id: place.place_id,
          placeId: place.place_id,
          name: place.name,
          address,
          city,
          region,
          latitude: place.geometry?.location?.lat?.() ?? 0,
          longitude: place.geometry?.location?.lng?.() ?? 0,
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
        };
      }));
    });
  }, []);

  const searchGooglePlaces = useCallback((query: string) => {
    if (!mapRef.current) return;

    const googleMaps = (window as unknown as GoogleMapsWindow).google;
    if (!googleMaps?.maps?.places) return;

    setPlaceSearchResults([]);
    const service = new googleMaps.maps.places.PlacesService(mapRef.current);
    const request = {
      query: `${query} orphanage`,
      location: defaultCenter,
      radius: 1200000,
      type: ['establishment'],
    };

    service.textSearch(request, (results: GooglePlaceResult[] | null, status: string) => {
      if (status !== 'OK' || !results) {
        setPlaceSearchResults([]);
        return;
      }

      setPlaceSearchResults(results.map((place) => {
        const address = place.formatted_address || place.vicinity || 'Cameroon';
        const { city, region } = deriveAddressParts(address);

        return {
          id: place.place_id,
          placeId: place.place_id,
          name: place.name,
          address,
          city,
          region,
          latitude: place.geometry?.location?.lat?.() ?? 0,
          longitude: place.geometry?.location?.lng?.() ?? 0,
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
        };
      }));
    });
  }, []);

  useEffect(() => {
    const query = mapSearchQuery.trim();
    if (!query) return;

    const timer = window.setTimeout(() => {
      searchGooglePlaces(query);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [mapSearchQuery, searchGooglePlaces]);

  const searchSuggestions = useMemo(() => {
    if (mapSearchQuery.trim() && placeSearchResults.length > 0) {
      return placeSearchResults;
    }

    const query = mapSearchQuery.trim();
    if (!query) return [];

    return orphanages
      .map((item) => ({ item, score: fuzzyScore(`${item.name} ${item.city} ${item.region}`, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => item as PlaceOrphanage | Orphanage);
  }, [mapSearchQuery, orphanages, placeSearchResults]);

  const selectedPin = stagedPins.find((pin) => pin.id === selectedPinId) ?? null;
  const selectedExisting = orphanages.find((item) => item.id === selectedExistingId) ?? null;
  const selectedPlace = placeOrphanages.find((place) => place.id === selectedPlaceId) ?? null;

  const handleMapLoad = useCallback((map: GoogleMapInstance) => {
    mapRef.current = map;
    loadGooglePlaces(map);
  }, [loadGooglePlaces]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat === undefined || lng === undefined) return;

    const googleMaps = (window as unknown as GoogleMapsWindow).google;
    if (googleMaps?.maps?.places && mapRef.current) {
      const service = new googleMaps.maps.places.PlacesService(mapRef.current);
      service.nearbySearch({ location: { lat, lng }, radius: 200, keyword: 'orphanage' }, (results: GooglePlaceResult[] | null, status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const place = results[0];
          const address = place.formatted_address || place.vicinity || 'Cameroon';
          const { city, region } = deriveAddressParts(address);
          const newPin = createBatchPinFromPlace({
            id: place.place_id,
            placeId: place.place_id,
            name: place.name,
            address,
            city,
            region,
            latitude: lat,
            longitude: lng,
            phone: place.formatted_phone_number,
            website: place.website,
            rating: place.rating,
          });
          setStagedPins((prev) => [...prev, newPin]);
          setSelectedPinId(newPin.id);
          setSelectedExistingId(null);
          setSelectedPlaceId(place.place_id);
          return;
        }

        const newPin = createBatchPin(lat, lng);
        setStagedPins((prev) => [...prev, newPin]);
        setSelectedPinId(newPin.id);
        setSelectedExistingId(null);
      });
      return;
    }

    const newPin = createBatchPin(lat, lng);
    setStagedPins((prev) => [...prev, newPin]);
    setSelectedPinId(newPin.id);
    setSelectedExistingId(null);
  }, []);

  const handleStageCustomCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || isNaN(lng)) {
      setStatusMessage({ type: 'error', text: 'Please enter valid numeric coordinates.' });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setStatusMessage({ type: 'error', text: 'Latitude must be between -90 and 90, Longitude between -180 and 180.' });
      return;
    }

    const newPin = createBatchPin(lat, lng);
    if (customName.trim()) {
      newPin.name = customName.trim();
    }

    setStagedPins((prev) => [...prev, newPin]);
    setSelectedPinId(newPin.id);
    setSelectedExistingId(null);

    setCustomLat('');
    setCustomLng('');
    setCustomName('');

    setStatusMessage({ type: 'success', text: 'Custom coordinates staged successfully.' });
  };

  const handleStageUpdate = (id: string, field: keyof BatchPin, value: string | number | boolean) => {
    setStagedPins((prev) => prev.map((pin) => (pin.id === id ? { ...pin, [field]: value } : pin)));
  };

  const handleRemoveStage = (id: string) => {
    setStagedPins((prev) => prev.filter((pin) => pin.id !== id));
    setSelectedPinId((current) => (current === id ? null : current));
  };

  const handleStagePlace = (place: PlaceOrphanage) => {
    const newPin = createBatchPinFromPlace(place);
    setStagedPins((prev) => [...prev, newPin]);
    setSelectedPinId(newPin.id);
    setSelectedExistingId(null);
    setSelectedPlaceId(place.id);
  };

  const handleSubmitBatch = async () => {
    if (!stagedPins.length) {
      setStatusMessage({ type: 'error', text: 'No staged orphanages to save.' });
      return;
    }

    setSubmittingBatch(true);
    setStatusMessage(null);

    try {
      await Promise.all(stagedPins.map((pin) =>
        addDoc(collection(db, 'orphanages'), {
          name: pin.name,
          region: pin.region,
          city: pin.city,
          latitude: pin.latitude,
          longitude: pin.longitude,
          phone: pin.phone,
          email: pin.email,
          capacity: pin.capacity,
          description: pin.description,
          photo: pin.photo,
          verified: pin.verified,
          createdAt: serverTimestamp(),
        })
      ));

      setStagedPins([]);
      setSelectedPinId(null);
      setSelectedPlaceId(null);
      setStatusMessage({ type: 'success', text: 'Batch entries saved successfully.' });
    } catch (err) {
      console.error('Batch save failed:', err);
      setStatusMessage({ type: 'error', text: 'Failed to save batch entries. Please retry.' });
    } finally {
      setSubmittingBatch(false);
    }
  };

  const activeCenter = selectedPlace
    ? { lat: selectedPlace.latitude, lng: selectedPlace.longitude }
    : selectedExisting
      ? { lat: selectedExisting.latitude, lng: selectedExisting.longitude }
      : selectedPin
        ? { lat: selectedPin.latitude, lng: selectedPin.longitude }
        : defaultCenter;

  const selectedPlaceMarker = placeOrphanages.find((place) => place.id === selectedPlaceId) ?? null;

  return (
    <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-4 select-none">
      <div className="mb-4">
        <h2 className="text-xl font-bold font-serif text-[#1E3A8A]">Batch Institution Entry</h2>
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
          Multi-Point Spatial Deployment
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-[360px] flex flex-col gap-4 shrink-0">
          <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 flex gap-3">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] font-black text-blue-800 uppercase tracking-wide leading-relaxed">
              Search Google Places for orphanages or click on the map to stage a location with place details.
            </p>
          </div>

          <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm flex items-center pr-1.5 pl-4 overflow-hidden focus-within:border-slate-300">
            <Search className="text-slate-400 mr-2.5 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search orphanages in Cameroon..."
              value={mapSearchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setMapSearchQuery(value);
                if (!value.trim()) {
                  setPlaceSearchResults([]);
                }
                setSelectedExistingId(null);
                setSelectedPlaceId(null);
              }}
              className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none py-3 placeholder-slate-400"
            />
          </div>

          {(placeSearchResults.length > 0 || (searchSuggestions.length > 0 && mapSearchQuery.trim())) && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              {(placeSearchResults.length > 0 ? placeSearchResults : searchSuggestions).map((result) => {
                const isPlace = 'placeId' in result;
                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      if (isPlace) {
                        handleStagePlace(result as PlaceOrphanage);
                      } else {
                        setSelectedExistingId((result as Orphanage).id);
                        setSelectedPinId(null);
                        setMapSearchQuery((result as Orphanage).name);
                      }
                    }}
                    className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900">{result.name}</div>
                    <div className="text-[11px] text-slate-500">{isPlace ? (result as PlaceOrphanage).address : `${(result as Orphanage).city}, ${(result as Orphanage).region}`}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Direct Coordinates Input Form */}
          <form
            onSubmit={handleStageCustomCoordinates}
            className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col gap-3"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Add Custom Location</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Input coordinates to place a pin directly</p>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Institution Name (Optional)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-slate-300 transition-colors"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Lat</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 6.613"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-slate-300 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Lng</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 12.125"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-slate-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-[#1E3A8A] text-slate-700 hover:text-white px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer"
            >
              <Plus size={14} />
              <span>Stage Custom Pin</span>
            </button>
          </form>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 min-h-[280px] flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Staged Locations</p>
                <p className="text-sm font-semibold text-slate-700">{stagedPins.length} item(s)</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase text-slate-500">
                Click map to add
              </div>
            </div>

            {statusMessage && (
              <div className={`rounded-3xl p-4 text-sm ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                {statusMessage.text}
              </div>
            )}

            <div className="space-y-3 overflow-y-auto max-h-[300px]">
              {stagedPins.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-3xl p-6 text-center text-slate-400">
                  <Plus size={18} className="mx-auto mb-2" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em]">No staged orphanages yet</p>
                </div>
              ) : (
                stagedPins.map((pin) => (
                  <div key={pin.id} className={`rounded-3xl border p-4 ${selectedPinId === pin.id ? 'border-[#1E3A8A] bg-slate-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPinId(pin.id)}
                        className="text-left"
                      >
                        <p className="font-semibold text-slate-900">{pin.name}</p>
                        <p className="text-[11px] text-slate-500">{pin.city || 'No city yet'}, {pin.region}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(pin.id)}
                        className="text-slate-400 hover:text-rose-500"
                        title="Remove staged pin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid gap-2">
                      <input
                        type="text"
                        value={pin.name}
                        onChange={(e) => handleStageUpdate(pin.id, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
                      />
                      <input
                        type="text"
                        value={pin.city}
                        onChange={(e) => handleStageUpdate(pin.id, 'city', e.target.value)}
                        placeholder="City"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
                      />
                      <input
                        type="text"
                        value={pin.region}
                        onChange={(e) => handleStageUpdate(pin.id, 'region', e.target.value)}
                        placeholder="Region"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Latitude</span>
                          <input
                            type="number"
                            step="any"
                            value={pin.latitude || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleStageUpdate(pin.id, 'latitude', val === '' ? 0 : parseFloat(val));
                            }}
                            placeholder="Latitude"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Longitude</span>
                          <input
                            type="number"
                            step="any"
                            value={pin.longitude || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleStageUpdate(pin.id, 'longitude', val === '' ? 0 : parseFloat(val));
                            }}
                            placeholder="Longitude"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitBatch}
              disabled={submittingBatch || stagedPins.length === 0}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#152960] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingBatch ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              {submittingBatch ? 'Saving...' : 'Save all staged entries'}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#E2E8F0]/40 rounded-3xl border border-slate-200 relative overflow-hidden min-h-[560px]">
          <div className="absolute top-6 right-6 z-10 bg-white/95 backdrop-blur border border-slate-200/80 rounded-2xl px-5 py-3 shadow-lg select-none text-left min-w-[120px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Map Status</span>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{stagedPins.length} staged</span>
          </div>

          {!isLoaded || loadingOrphanages ? (
            <LoadingScreen message="Syncing spatial data..." />
          ) : loadError ? (
            <div className="w-full h-full flex items-center justify-center p-8 text-slate-500">
              <p>Error loading Google Maps. Check your API key.</p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={activeCenter}
              zoom={selectedPlace || selectedExisting || selectedPin ? 10 : 7}
              onClick={handleMapClick}
              onLoad={handleMapLoad}
              options={{
                clickableIcons: false,
                fullscreenControl: true,
                zoomControl: true,
                mapTypeControl: false,
                restriction: {
                  latLngBounds: CAMEROON_BOUNDS,
                  strictBounds: false,
                },
                minZoom: 5,
                maxZoom: 12,
              }}
            >
              {orphanages.map((orphanage) => (
                <Marker
                  key={orphanage.id}
                  position={{ lat: orphanage.latitude, lng: orphanage.longitude }}
                  title={orphanage.name}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
                    fillColor: orphanage.verified ? '#10B981' : '#F97316',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: 1.1,
                  }}
                  onClick={() => {
                    setSelectedExistingId(orphanage.id);
                    setSelectedPinId(null);
                    setSelectedPlaceId(null);
                  }}
                />
              ))}

              {placeOrphanages.map((place) => (
                <Marker
                  key={place.id}
                  position={{ lat: place.latitude, lng: place.longitude }}
                  title={place.name}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
                    fillColor: '#2563EB',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: 1.1,
                  }}
                  onClick={() => {
                    setSelectedPlaceId(place.id);
                    setSelectedPinId(null);
                    setSelectedExistingId(null);
                  }}
                />
              ))}

              {selectedExisting && (
                <InfoWindow
                  position={{ lat: selectedExisting.latitude, lng: selectedExisting.longitude }}
                  onCloseClick={() => setSelectedExistingId(null)}
                >
                  <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
                    <strong className="block text-sm font-semibold mb-1">{selectedExisting.name}</strong>
                    <div className="text-slate-600 text-[11px]">{selectedExisting.city}, {selectedExisting.region}</div>
                    <div className="text-[11px] text-slate-500 mt-2">Verified: {selectedExisting.verified ? 'Yes' : 'No'}</div>
                  </div>
                </InfoWindow>
              )}

              {selectedPlaceMarker && (
                <InfoWindow
                  position={{ lat: selectedPlaceMarker.latitude, lng: selectedPlaceMarker.longitude }}
                  onCloseClick={() => setSelectedPlaceId(null)}
                >
                  <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
                    <strong className="block text-sm font-semibold mb-1">{selectedPlaceMarker.name}</strong>
                    <div className="text-slate-600 text-[11px]">{selectedPlaceMarker.address}</div>
                    <div className="text-[11px] text-slate-500 mt-2">Click the place to stage it to the batch.</div>
                  </div>
                </InfoWindow>
              )}

              {selectedPin && (
                <InfoWindow
                  position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
                  onCloseClick={() => setSelectedPinId(null)}
                >
                  <div className="max-w-xs text-[13px] leading-snug text-slate-800 font-sans">
                    <strong className="block text-sm font-semibold mb-1">{selectedPin.name}</strong>
                    <div className="text-slate-600 text-[11px]">{selectedPin.city || 'No city selected'}</div>
                    <div className="text-[11px] text-slate-500 mt-2">Click a staged item to update details.</div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`fixed right-5 top-5 z-50 max-w-sm rounded-3xl border p-4 shadow-2xl transition-opacity ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-sm font-semibold uppercase tracking-[0.16em]">
              {statusMessage.type === 'success' ? 'Saved' : 'Error'}
            </span>
            <p className="text-sm leading-5">{statusMessage.text}</p>
          </div>
        </div>
      )}
    </main>
  );
}
