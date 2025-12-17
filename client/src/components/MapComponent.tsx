import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Address, POI, Coordinates, POICategory } from '../../../shared/types';
import { formatDistance, estimateWalkingTime } from '@/lib/geocoding';

const addressIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: hsl(217, 91%, 60%);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const midpointIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, hsl(39, 85%, 50%), hsl(39, 85%, 40%));
    border: 4px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const POI_COLORS: Record<POICategory, string> = {
  biergarten: 'hsl(39, 85%, 50%)',
  restaurant: 'hsl(0, 84%, 60%)',
  cafe: 'hsl(25, 75%, 55%)',
  park: 'hsl(140, 60%, 45%)',
  bar: 'hsl(280, 65%, 55%)',
};

function createPOIIcon(category: POICategory, isSelected: boolean) {
  const color = POI_COLORS[category];
  const size = isSelected ? 28 : 20;
  const borderWidth = isSelected ? 3 : 2;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${borderWidth}px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ${isSelected ? 'transform: scale(1.1);' : ''}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface MapUpdaterProps {
  addresses: Address[];
  midpoint: Coordinates | null;
  selectedPOI: POI | null;
}

function MapUpdater({ addresses, midpoint, selectedPOI }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedPOI) {
      map.flyTo([selectedPOI.lat, selectedPOI.lng], 17, { duration: 0.5 });
      return;
    }

    if (midpoint) {
      map.flyTo([midpoint.lat, midpoint.lng], 14, { duration: 0.5 });
      return;
    }

    const validAddresses = addresses.filter(a => a.lat && a.lng);
    if (validAddresses.length > 0) {
      const bounds = L.latLngBounds(
        validAddresses.map(a => [a.lat!, a.lng!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, addresses, midpoint, selectedPOI]);

  return null;
}

interface MapComponentProps {
  addresses: Address[];
  midpoint: Coordinates | null;
  pois: POI[];
  radius: number;
  selectedPOI: POI | null;
  onPOIClick: (poi: POI) => void;
}

export function MapComponent({
  addresses,
  midpoint,
  pois,
  radius,
  selectedPOI,
  onPOIClick,
}: MapComponentProps) {
  const mapRef = useRef<L.Map>(null);

  const validAddresses = useMemo(
    () => addresses.filter((a): a is Address & { lat: number; lng: number } => 
      a.status === 'success' && a.lat !== undefined && a.lng !== undefined
    ),
    [addresses]
  );

  const defaultCenter: [number, number] = [51.1657, 10.4515];
  const defaultZoom = 6;

  return (
    <div className="h-full w-full relative" data-testid="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater 
          addresses={addresses} 
          midpoint={midpoint} 
          selectedPOI={selectedPOI}
        />

        {validAddresses.map((address) => (
          <Marker
            key={address.id}
            position={[address.lat, address.lng]}
            icon={addressIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{address.originalText}</p>
                {address.geocodedAddress && (
                  <p className="text-xs text-gray-600 mt-1">{address.geocodedAddress}</p>
                )}
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {midpoint && (
          <>
            <Circle
              center={[midpoint.lat, midpoint.lng]}
              radius={radius}
              pathOptions={{
                color: 'hsl(39, 85%, 50%)',
                fillColor: 'hsl(39, 85%, 50%)',
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
            <Marker
              position={[midpoint.lat, midpoint.lng]}
              icon={midpointIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Geografischer Mittelpunkt</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {midpoint.lat.toFixed(5)}, {midpoint.lng.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={createPOIIcon(poi.category, selectedPOI?.id === poi.id)}
            eventHandlers={{
              click: () => onPOIClick(poi),
            }}
          >
            <Popup>
              <div className="text-sm min-w-[180px]">
                <p className="font-semibold">{poi.name}</p>
                <p className="text-xs text-gray-600 capitalize mt-1">{poi.category}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-2">
                  <span>{formatDistance(poi.distance)}</span>
                  <span>{estimateWalkingTime(poi.distance)} zu Fuß</span>
                </div>
                {poi.address && (
                  <p className="text-xs text-gray-500 mt-1">{poi.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          className="w-8 h-8 bg-background rounded-md shadow-md flex items-center justify-center text-lg font-bold hover-elevate"
          onClick={() => mapRef.current?.zoomIn()}
          data-testid="button-zoom-in"
        >
          +
        </button>
        <button
          className="w-8 h-8 bg-background rounded-md shadow-md flex items-center justify-center text-lg font-bold hover-elevate"
          onClick={() => mapRef.current?.zoomOut()}
          data-testid="button-zoom-out"
        >
          −
        </button>
      </div>
    </div>
  );
}
