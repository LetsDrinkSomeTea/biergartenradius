import type { Address, Coordinates } from '../../../shared/types';

export async function geocodeAddress(
  address: string,
  timeoutMs = 15000
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error('Zu viele Anfragen. Bitte warten.');
      }
      throw new Error(errorData.error || `Geocoding fehlgeschlagen (${response.status})`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Geocoding timeout for:', address);
      return null;
    }
    console.error('Geocoding error:', error);
    return null;
  }
}

export function calculateMidpoint(addresses: Address[]): Coordinates | null {
  const validAddresses = addresses.filter(
    (addr): addr is Address & { lat: number; lng: number } =>
      addr.status === 'success' && addr.lat !== undefined && addr.lng !== undefined
  );

  if (validAddresses.length === 0) {
    return null;
  }

  if (validAddresses.length === 1) {
    return { lat: validAddresses[0].lat, lng: validAddresses[0].lng };
  }

  let x = 0;
  let y = 0;
  let z = 0;

  for (const addr of validAddresses) {
    const latRad = (addr.lat * Math.PI) / 180;
    const lngRad = (addr.lng * Math.PI) / 180;

    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }

  const total = validAddresses.length;
  x /= total;
  y /= total;
  z /= total;

  const centralLng = Math.atan2(y, x);
  const centralSqrt = Math.sqrt(x * x + y * y);
  const centralLat = Math.atan2(z, centralSqrt);

  return {
    lat: (centralLat * 180) / Math.PI,
    lng: (centralLng * 180) / Math.PI,
  };
}

export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371000;
  const lat1Rad = (point1.lat * Math.PI) / 180;
  const lat2Rad = (point2.lat * Math.PI) / 180;
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function estimateWalkingTime(meters: number): string {
  const walkingSpeedMps = 1.4;
  const seconds = meters / walkingSpeedMps;
  const minutes = Math.round(seconds / 60);
  
  if (minutes < 1) {
    return '< 1 Min.';
  }
  if (minutes === 1) {
    return '1 Min.';
  }
  return `${minutes} Min.`;
}
