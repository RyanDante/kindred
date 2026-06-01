import type { BatchPin, PlaceImportFields, PlaceOrphanage } from '../types/orphanage';

export function applyPlaceImportFields(
  place: PlaceOrphanage,
  fields: PlaceImportFields
): BatchPin {
  const pin: BatchPin = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: fields.name ? place.name : 'New institution',
    region: fields.region ? (place.region || 'Cameroon') : 'Central',
    city: fields.city ? (place.city || 'Cameroon') : '',
    latitude: fields.latitude ? place.latitude : 0,
    longitude: fields.longitude ? place.longitude : 0,
    phone: fields.phone ? (place.phone || '') : '',
    email: '',
    capacity: 0,
    description: fields.description ? (place.description || place.address) : '',
    photo: fields.photo ? (place.photo || '') : '',
    verified: false,
    placeId: place.placeId,
  };

  if (fields.website && place.website) pin.website = place.website;
  if (fields.googleMapsUrl && place.googleMapsUrl) pin.googleMapsUrl = place.googleMapsUrl;
  if (fields.rating && place.rating != null) pin.rating = place.rating;

  if (fields.reviews && place.reviews?.length) {
    pin.reviews = place.reviews.slice(0, fields.reviewCount);
  }

  return pin;
}
