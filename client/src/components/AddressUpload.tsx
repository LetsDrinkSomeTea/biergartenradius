import { useCallback, useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseAddressFile } from '@/lib/csv-utils';

interface AddressUploadProps {
  onAddressesAdded: (addresses: string[]) => void;
  disabled?: boolean;
}

export function AddressUpload({ onAddressesAdded, disabled }: AddressUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => f.name.endsWith('.csv') || f.name.endsWith('.txt'));
    
    if (file) {
      try {
        const addresses = await parseAddressFile(file);
        onAddressesAdded(addresses);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
  }, [onAddressesAdded, disabled]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      try {
        const addresses = await parseAddressFile(file);
        onAddressesAdded(addresses);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
    e.target.value = '';
  }, [onAddressesAdded, disabled]);

  const handleManualAdd = useCallback(() => {
    if (manualAddress.trim() && !disabled) {
      onAddressesAdded([manualAddress.trim()]);
      setManualAddress('');
    }
  }, [manualAddress, onAddressesAdded, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualAdd();
    }
  }, [handleManualAdd]);

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-md p-6 transition-colors
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="dropzone-upload"
      >
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
          data-testid="input-file-upload"
        />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-3 rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Adressen hochladen</p>
            <p className="text-xs text-muted-foreground mt-1">
              CSV oder TXT Datei hierher ziehen
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>Eine Adresse pro Zeile</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Adresse manuell eingeben..."
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          data-testid="input-manual-address"
        />
        <Button
          size="icon"
          variant="secondary"
          onClick={handleManualAdd}
          disabled={disabled || !manualAddress.trim()}
          data-testid="button-add-address"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
