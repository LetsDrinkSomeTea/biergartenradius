import { MapPin, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Address } from '../../../shared/types';

interface AddressListProps {
  addresses: Address[];
  onRemove: (id: string) => void;
  onAddressClick?: (address: Address) => void;
  disabled?: boolean;
}

export function AddressList({ addresses, onRemove, onAddressClick, disabled }: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Noch keine Adressen hinzugefügt</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2 pr-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`
              group flex items-start gap-3 p-3 rounded-md bg-muted/50
              ${address.status === 'success' && onAddressClick ? 'cursor-pointer hover-elevate' : ''}
              ${address.status === 'error' ? 'bg-destructive/10' : ''}
            `}
            onClick={() => address.status === 'success' && onAddressClick?.(address)}
            data-testid={`card-address-${address.id}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {address.status === 'pending' && (
                <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />
              )}
              {address.status === 'geocoding' && (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              )}
              {address.status === 'success' && (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              {address.status === 'error' && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" title={address.originalText}>
                {address.originalText}
              </p>
              {address.status === 'success' && address.lat && address.lng && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
                </p>
              )}
              {address.status === 'error' && address.errorMessage && (
                <p className="text-xs text-destructive mt-0.5">
                  {address.errorMessage}
                </p>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(address.id);
              }}
              disabled={disabled}
              data-testid={`button-remove-address-${address.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
