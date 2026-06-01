import type { BatchPin, PlaceOrphanage } from '../types/orphanage';

export const createBatchPin = (lat: number, lng: number): BatchPin => ({
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

export const createBatchPinFromPlace = (place: PlaceOrphanage): BatchPin => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: place.name,
  region: place.region || 'Cameroon',
  city: place.city || 'Cameroon',
  latitude: place.latitude,
  longitude: place.longitude,
  phone: place.phone || '',
  email: '',
  capacity: 0,
  description: place.description || place.address,
  photo: place.photo || '',
  verified: false,
});
