export interface Address {
  id: string;
  originalText: string;
  lat?: number;
  lng?: number;
  geocodedAddress?: string;
  status: 'pending' | 'geocoding' | 'success' | 'error';
  errorMessage?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
  distance: number;
  address?: string;
  openingHours?: string;
}

export type POICategory = 
  | 'biergarten'
  | 'restaurant'
  | 'cafe'
  | 'park'
  | 'bar';

export const POI_CATEGORIES: { value: POICategory; label: string; icon: string }[] = [
  { value: 'biergarten', label: 'Biergärten', icon: 'beer' },
  { value: 'restaurant', label: 'Restaurants', icon: 'utensils' },
  { value: 'cafe', label: 'Cafés', icon: 'coffee' },
  { value: 'park', label: 'Parks', icon: 'trees' },
  { value: 'bar', label: 'Bars', icon: 'wine' },
];

export interface AppState {
  addresses: Address[];
  midpoint: Coordinates | null;
  pois: POI[];
  radius: number;
  selectedCategories: POICategory[];
  isCalculating: boolean;
  isSearchingPOIs: boolean;
  selectedPOI: POI | null;
}
