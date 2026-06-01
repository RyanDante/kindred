import { Timestamp } from 'firebase/firestore';

export interface PlaceReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTime?: string;
}

export interface Orphanage {
  id: string;
  name: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  capacity: number;
  description: string;
  photo: string;
  verified: boolean;
  website?: string;
  openHours?: string;
  photos?: string[];
  videos?: string[];
  googleMapsUrl?: string;
  rating?: number;
  reviews?: PlaceReview[];
  placeId?: string;
  createdAt?: Timestamp | null;
}

export interface BatchPin {
  id: string;
  name: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  capacity: number;
  description: string;
  photo: string;
  verified: boolean;
  website?: string;
  openHours?: string;
  photos?: string[];
  videos?: string[];
  googleMapsUrl?: string;
  rating?: number;
  reviews?: PlaceReview[];
  placeId?: string;
}

export interface PlaceOrphanage {
  id: string;
  placeId: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  rating?: number;
  photo?: string;
  description?: string;
  reviews?: PlaceReview[];
}

export interface PlaceImportFields {
  name: boolean;
  region: boolean;
  city: boolean;
  latitude: boolean;
  longitude: boolean;
  phone: boolean;
  photo: boolean;
  description: boolean;
  website: boolean;
  googleMapsUrl: boolean;
  rating: boolean;
  reviews: boolean;
  reviewCount: number;
}

export const DEFAULT_IMPORT_FIELDS: PlaceImportFields = {
  name: true,
  region: true,
  city: true,
  latitude: true,
  longitude: true,
  phone: true,
  photo: true,
  description: true,
  website: true,
  googleMapsUrl: true,
  rating: true,
  reviews: true,
  reviewCount: 4,
};

export interface DirectoryItem {
  id: string;
  name: string;
  city: string;
  region: string;
  verified: boolean;
  latitude?: number;
  longitude?: number;
}
