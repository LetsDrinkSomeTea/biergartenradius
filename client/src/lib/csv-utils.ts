import Papa from 'papaparse';
import type { Address, POI, Coordinates } from '../../../shared/types';
import { formatDistance } from './geocoding';

export function parseAddressFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        const result = Papa.parse(text, {
          skipEmptyLines: true,
        });
        
        const addresses: string[] = [];
        for (const row of result.data as string[][]) {
          const address = row.join(', ').trim();
          if (address) {
            addresses.push(address);
          }
        }
        resolve(addresses);
      } else {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        resolve(lines);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Datei konnte nicht gelesen werden'));
    };
    
    reader.readAsText(file);
  });
}

export function exportAddressesCSV(addresses: Address[], midpoint: Coordinates | null): void {
  const rows: string[][] = [];
  
  rows.push(['type', 'address', 'latitude', 'longitude', 'status']);
  
  for (const addr of addresses) {
    rows.push([
      'address',
      addr.originalText,
      addr.lat?.toString() || '',
      addr.lng?.toString() || '',
      addr.status,
    ]);
  }
  
  if (midpoint) {
    rows.push(['midpoint', '', midpoint.lat.toString(), midpoint.lng.toString(), 'calculated']);
  }
  
  downloadCSV(rows, 'biergartenradius-adressen');
}

export function exportPOIsCSV(pois: POI[], midpoint: Coordinates | null): void {
  const rows: string[][] = [];
  
  rows.push(['name', 'category', 'latitude', 'longitude', 'distance_meters', 'address']);
  
  for (const poi of pois) {
    rows.push([
      poi.name,
      poi.category,
      poi.lat.toString(),
      poi.lng.toString(),
      Math.round(poi.distance).toString(),
      poi.address || '',
    ]);
  }
  
  downloadCSV(rows, 'biergartenradius-orte');
}

export function exportResultsToCSV(
  addresses: Address[],
  midpoint: Coordinates | null,
  pois: POI[]
): void {
  const rows: string[][] = [];
  
  rows.push(['type', 'name', 'category', 'latitude', 'longitude', 'distance_meters', 'status', 'original_address']);
  
  for (const addr of addresses) {
    rows.push([
      'address',
      addr.geocodedAddress || addr.originalText,
      '',
      addr.lat?.toString() || '',
      addr.lng?.toString() || '',
      '',
      addr.status,
      addr.originalText,
    ]);
  }
  
  if (midpoint) {
    rows.push([
      'midpoint',
      'Geografischer Mittelpunkt',
      '',
      midpoint.lat.toString(),
      midpoint.lng.toString(),
      '0',
      'calculated',
      '',
    ]);
  }
  
  for (const poi of pois) {
    rows.push([
      'poi',
      poi.name,
      poi.category,
      poi.lat.toString(),
      poi.lng.toString(),
      Math.round(poi.distance).toString(),
      'found',
      poi.address || '',
    ]);
  }
  
  downloadCSV(rows, 'biergartenradius-komplett');
}

function downloadCSV(rows: string[][], filename: string): void {
  const csv = Papa.unparse(rows);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
