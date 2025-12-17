import { Beer, Utensils, Coffee, Trees, Wine, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { POI, POICategory } from '../../../shared/types';
import { formatDistance, estimateWalkingTime } from '@/lib/geocoding';

interface POIListProps {
  pois: POI[];
  selectedPOI: POI | null;
  onPOIClick: (poi: POI) => void;
  isLoading?: boolean;
}

const CATEGORY_ICONS: Record<POICategory, typeof Beer> = {
  biergarten: Beer,
  restaurant: Utensils,
  cafe: Coffee,
  park: Trees,
  bar: Wine,
};

const CATEGORY_LABELS: Record<POICategory, string> = {
  biergarten: 'Biergarten',
  restaurant: 'Restaurant',
  cafe: 'Café',
  park: 'Park',
  bar: 'Bar',
};

export function POIList({ pois, selectedPOI, onPOIClick, isLoading }: POIListProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Suche Orte in der Nähe...</span>
        </div>
      </div>
    );
  }

  if (pois.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Beer className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Keine Orte gefunden</p>
        <p className="text-xs mt-1">Versuche einen größeren Radius</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-2 pr-3">
        {pois.map((poi) => {
          const Icon = CATEGORY_ICONS[poi.category];
          const isSelected = selectedPOI?.id === poi.id;
          
          return (
            <div
              key={poi.id}
              className={`
                group p-3 rounded-md transition-colors cursor-pointer
                ${isSelected 
                  ? 'bg-primary/15 ring-1 ring-primary/30' 
                  : 'bg-muted/50 hover-elevate'
                }
              `}
              onClick={() => onPOIClick(poi)}
              data-testid={`card-poi-${poi.id}`}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-md flex-shrink-0
                  ${isSelected ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate" title={poi.name}>
                      {poi.name}
                    </h4>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {CATEGORY_LABELS[poi.category]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {formatDistance(poi.distance)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {estimateWalkingTime(poi.distance)}
                    </span>
                  </div>
                  
                  {poi.address && (
                    <p className="text-xs text-muted-foreground mt-1 truncate" title={poi.address}>
                      {poi.address}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs w-full justify-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lng}#map=18/${poi.lat}/${poi.lng}`,
                      '_blank'
                    );
                  }}
                  data-testid={`button-open-osm-${poi.id}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  In OpenStreetMap öffnen
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
