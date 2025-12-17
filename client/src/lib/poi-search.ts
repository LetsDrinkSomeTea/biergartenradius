import type { POI, POICategory, Coordinates } from '../../../shared/types';
import { calculateDistance } from './geocoding';

const CATEGORY_QUERIES: Record<POICategory, string> = {
  biergarten: 'node["amenity"="biergarten"](around:{radius},{lat},{lng});way["amenity"="biergarten"](around:{radius},{lat},{lng});',
  restaurant: 'node["amenity"="restaurant"](around:{radius},{lat},{lng});way["amenity"="restaurant"](around:{radius},{lat},{lng});',
  cafe: 'node["amenity"="cafe"](around:{radius},{lat},{lng});way["amenity"="cafe"](around:{radius},{lat},{lng});',
  park: 'node["leisure"="park"](around:{radius},{lat},{lng});way["leisure"="park"](around:{radius},{lat},{lng});node["leisure"="garden"]["garden:type"="beer_garden"](around:{radius},{lat},{lng});',
  bar: 'node["amenity"="bar"](around:{radius},{lat},{lng});way["amenity"="bar"](around:{radius},{lat},{lng});node["amenity"="pub"](around:{radius},{lat},{lng});way["amenity"="pub"](around:{radius},{lat},{lng});',
};

function buildOverpassQuery(center: Coordinates, radius: number, categories: POICategory[]): string {
  let queries = '';
  
  for (const category of categories) {
    const query = CATEGORY_QUERIES[category]
      .replace(/{radius}/g, radius.toString())
      .replace(/{lat}/g, center.lat.toString())
      .replace(/{lng}/g, center.lng.toString());
    queries += query;
  }

  return `[out:json][timeout:25];(${queries});out center;`;
}

function determineCategory(tags: Record<string, string>): POICategory {
  if (tags.amenity === 'biergarten') return 'biergarten';
  if (tags.amenity === 'restaurant') return 'restaurant';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'bar' || tags.amenity === 'pub') return 'bar';
  if (tags.leisure === 'park' || tags.leisure === 'garden') return 'park';
  return 'restaurant';
}

export async function searchPOIs(
  center: Coordinates,
  radius: number,
  categories: POICategory[],
  timeoutMs = 30000
): Promise<POI[]> {
  if (categories.length === 0) {
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const query = buildOverpassQuery(center, radius, categories);
    
    const response = await fetch('/api/pois', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error('API überlastet. Bitte später erneut versuchen.');
      }
      throw new Error(errorData.error || `POI-Suche fehlgeschlagen (${response.status})`);
    }

    const data = await response.json();
    
    const pois: POI[] = [];
    const seenIds = new Set<string>();

    for (const element of data.elements) {
      const id = `${element.type}-${element.id}`;
      
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lon;
      
      if (!lat || !lng) continue;

      const tags = element.tags || {};
      const name = tags.name || tags['name:de'] || 'Unbekannt';
      
      const distance = calculateDistance(center, { lat, lng });
      
      pois.push({
        id,
        name,
        category: determineCategory(tags),
        lat,
        lng,
        distance,
        address: tags['addr:street'] 
          ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}, ${tags['addr:city'] || ''}`.trim()
          : undefined,
        openingHours: tags.opening_hours,
      });
    }

    pois.sort((a, b) => a.distance - b.distance);

    return pois;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('POI search timeout');
      throw new Error('Zeitüberschreitung bei der POI-Suche');
    }
    console.error('POI search error:', error);
    throw error;
  }
}
