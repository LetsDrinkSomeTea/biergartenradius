import { useState, useCallback } from 'react';
import { Beer, Download, Trash2, Navigation, Globe, Menu, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AddressUpload } from '@/components/AddressUpload';
import { AddressList } from '@/components/AddressList';
import { RadiusSlider } from '@/components/RadiusSlider';
import { POIFilter } from '@/components/POIFilter';
import { POIList } from '@/components/POIList';
import { MapComponent } from '@/components/MapComponent';
import { geocodeAddress, calculateMidpoint } from '@/lib/geocoding';
import { searchPOIs } from '@/lib/poi-search';
import { exportResultsToCSV } from '@/lib/csv-utils';
import type { Address, POI, POICategory, Coordinates } from '../../../shared/types';

export default function Home() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [midpoint, setMidpoint] = useState<Coordinates | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [radius, setRadius] = useState(1500);
  const [selectedCategories, setSelectedCategories] = useState<POICategory[]>([
    'biergarten',
    'restaurant',
    'cafe',
    'bar',
  ]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSearchingPOIs, setIsSearchingPOIs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleAddressesAdded = useCallback((newAddresses: string[]) => {
    const addressObjects: Address[] = newAddresses.map((text, index) => ({
      id: `${Date.now()}-${index}`,
      originalText: text,
      status: 'pending',
    }));
    setAddresses((prev) => [...prev, ...addressObjects]);
    setMidpoint(null);
    setPois([]);
  }, []);

  const handleRemoveAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setMidpoint(null);
    setPois([]);
  }, []);

  const handleClearAll = useCallback(() => {
    setAddresses([]);
    setMidpoint(null);
    setPois([]);
    setSelectedPOI(null);
  }, []);

  const handleCalculateMidpoint = useCallback(async () => {
    if (addresses.length === 0) {
      toast({
        title: 'Keine Adressen',
        description: 'Bitte füge mindestens eine Adresse hinzu.',
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);
    setSelectedPOI(null);

    const updatedAddresses = [...addresses];
    let successfulCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < updatedAddresses.length; i++) {
      const addr = updatedAddresses[i];
      
      if (addr.status === 'success') {
        successfulCount++;
        continue;
      }

      updatedAddresses[i] = { ...addr, status: 'geocoding' };
      setAddresses([...updatedAddresses]);

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await geocodeAddress(addr.originalText);
      
      if (result) {
        updatedAddresses[i] = {
          ...addr,
          status: 'success',
          lat: result.lat,
          lng: result.lng,
          geocodedAddress: result.displayName,
        };
        successfulCount++;
      } else {
        updatedAddresses[i] = {
          ...addr,
          status: 'error',
          errorMessage: 'Adresse nicht gefunden',
        };
        failedCount++;
      }
      
      setAddresses([...updatedAddresses]);
    }

    const calculatedMidpoint = calculateMidpoint(updatedAddresses);
    
    if (calculatedMidpoint) {
      setMidpoint(calculatedMidpoint);
      
      if (failedCount > 0) {
        toast({
          title: 'Mittelpunkt berechnet',
          description: `${successfulCount} Adresse${successfulCount !== 1 ? 'n' : ''} gefunden, ${failedCount} fehlgeschlagen.`,
        });
      } else {
        toast({
          title: 'Mittelpunkt berechnet',
          description: 'Der geografische Mittelpunkt wurde erfolgreich ermittelt.',
        });
      }

      setIsSearchingPOIs(true);
      try {
        const foundPois = await searchPOIs(calculatedMidpoint, radius, selectedCategories);
        setPois(foundPois);

        if (foundPois.length === 0) {
          toast({
            title: 'Keine Orte gefunden',
            description: 'Versuche einen größeren Radius oder andere Kategorien.',
          });
        }
      } catch (error) {
        toast({
          title: 'POI-Suche fehlgeschlagen',
          description: error instanceof Error ? error.message : 'Bitte später erneut versuchen.',
          variant: 'destructive',
        });
      }
      setIsSearchingPOIs(false);
    } else {
      toast({
        title: 'Berechnung fehlgeschlagen',
        description: 'Keine gültigen Adressen zum Berechnen des Mittelpunkts.',
        variant: 'destructive',
      });
    }

    setIsCalculating(false);
  }, [addresses, radius, selectedCategories, toast]);

  const handleSearchPOIs = useCallback(async () => {
    if (!midpoint) return;

    setIsSearchingPOIs(true);
    setSelectedPOI(null);
    
    try {
      const foundPois = await searchPOIs(midpoint, radius, selectedCategories);
      setPois(foundPois);

      if (foundPois.length === 0) {
        toast({
          title: 'Keine Orte gefunden',
          description: 'Versuche einen größeren Radius oder andere Kategorien.',
        });
      }
    } catch (error) {
      toast({
        title: 'POI-Suche fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Bitte später erneut versuchen.',
        variant: 'destructive',
      });
    }
    
    setIsSearchingPOIs(false);
  }, [midpoint, radius, selectedCategories, toast]);

  const handleExport = useCallback(() => {
    exportResultsToCSV(addresses, midpoint, pois);
    toast({
      title: 'Export erfolgreich',
      description: 'Die CSV-Datei wurde heruntergeladen.',
    });
  }, [addresses, midpoint, pois, toast]);

  const handleAddressClick = useCallback((address: Address) => {
    if (address.lat && address.lng) {
      setSelectedPOI(null);
    }
  }, []);

  const successCount = addresses.filter((a) => a.status === 'success').length;
  const isProcessing = isCalculating || isSearchingPOIs;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-toggle-sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Beer className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Biergartenradius</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="cursor-help">
                <Badge variant="outline" className="gap-1 hidden sm:flex">
                  <Globe className="h-3 w-3" />
                  OpenStreetMap
                  <Info className="h-3 w-3 opacity-50" />
                </Badge>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              <p>Adressen werden über OpenStreetMap Nominatim API geocodiert. POIs werden über Overpass API abgefragt. Keine Daten werden gespeichert.</p>
            </TooltipContent>
          </Tooltip>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`
            w-full lg:w-[420px] flex-shrink-0 border-r bg-background overflow-y-auto
            absolute lg:relative inset-0 top-14 z-50 lg:z-auto
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Adressen
              </h2>
              <AddressUpload
                onAddressesAdded={handleAddressesAdded}
                disabled={isProcessing}
              />
              
              <div className="mt-4">
                <AddressList
                  addresses={addresses}
                  onRemove={handleRemoveAddress}
                  onAddressClick={handleAddressClick}
                  disabled={isProcessing}
                />
              </div>

              {addresses.length > 0 && (
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    onClick={handleCalculateMidpoint}
                    disabled={isProcessing || addresses.length === 0}
                    data-testid="button-calculate-midpoint"
                  >
                    {isCalculating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Berechne...
                      </>
                    ) : (
                      'Mittelpunkt berechnen'
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    data-testid="button-clear-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </section>

            {midpoint && (
              <>
                <Separator />
                
                <section>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Mittelpunkt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs font-mono text-muted-foreground">
                        {midpoint.lat.toFixed(6)}, {midpoint.lng.toFixed(6)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Berechnet aus {successCount} Adresse{successCount !== 1 ? 'n' : ''}
                      </p>
                    </CardContent>
                  </Card>
                </section>

                <Separator />

                <section>
                  <h2 className="text-lg font-semibold mb-3">Orte suchen</h2>
                  
                  <div className="space-y-4">
                    <RadiusSlider
                      value={radius}
                      onChange={setRadius}
                      disabled={isProcessing}
                    />

                    <POIFilter
                      selectedCategories={selectedCategories}
                      onChange={setSelectedCategories}
                      disabled={isProcessing}
                    />

                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={handleSearchPOIs}
                      disabled={isProcessing || selectedCategories.length === 0}
                      data-testid="button-search-pois"
                    >
                      {isSearchingPOIs ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Suche...
                        </>
                      ) : (
                        'Orte suchen'
                      )}
                    </Button>
                  </div>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">
                      Ergebnisse
                      {pois.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {pois.length}
                        </Badge>
                      )}
                    </h2>
                  </div>

                  <POIList
                    pois={pois}
                    selectedPOI={selectedPOI}
                    onPOIClick={setSelectedPOI}
                    isLoading={isSearchingPOIs}
                  />
                </section>

                {(addresses.length > 0 || pois.length > 0) && (
                  <>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleExport}
                      data-testid="button-export-csv"
                    >
                      <Download className="h-4 w-4" />
                      Als CSV exportieren
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </aside>

        <main className="flex-1 relative">
          <MapComponent
            addresses={addresses}
            midpoint={midpoint}
            pois={pois}
            radius={radius}
            selectedPOI={selectedPOI}
            onPOIClick={setSelectedPOI}
          />
        </main>
      </div>
    </div>
  );
}
