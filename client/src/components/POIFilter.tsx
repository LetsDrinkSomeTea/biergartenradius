import { Beer, Utensils, Coffee, Trees, Wine } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { POICategory } from '../../../shared/types';

interface POIFilterProps {
  selectedCategories: POICategory[];
  onChange: (categories: POICategory[]) => void;
  disabled?: boolean;
}

const CATEGORY_CONFIG: { value: POICategory; label: string; icon: typeof Beer }[] = [
  { value: 'biergarten', label: 'Biergärten', icon: Beer },
  { value: 'restaurant', label: 'Restaurants', icon: Utensils },
  { value: 'cafe', label: 'Cafés', icon: Coffee },
  { value: 'park', label: 'Parks', icon: Trees },
  { value: 'bar', label: 'Bars', icon: Wine },
];

export function POIFilter({ selectedCategories, onChange, disabled }: POIFilterProps) {
  const allSelected = selectedCategories.length === CATEGORY_CONFIG.length;

  const toggleCategory = (category: POICategory) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(CATEGORY_CONFIG.map(c => c.value));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Kategorien</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAll}
          disabled={disabled}
          className="h-7 text-xs"
          data-testid="button-toggle-all-categories"
        >
          {allSelected ? 'Keine' : 'Alle'}
        </Button>
      </div>

      <div className="space-y-2">
        {CATEGORY_CONFIG.map((category) => {
          const Icon = category.icon;
          const isChecked = selectedCategories.includes(category.value);
          
          return (
            <div
              key={category.value}
              className={`
                flex items-center gap-3 p-2.5 rounded-md transition-colors
                ${isChecked ? 'bg-primary/10' : 'bg-muted/50'}
                ${disabled ? 'opacity-50' : 'hover-elevate cursor-pointer'}
              `}
              onClick={() => !disabled && toggleCategory(category.value)}
              data-testid={`filter-category-${category.value}`}
            >
              <Checkbox
                id={category.value}
                checked={isChecked}
                onCheckedChange={() => toggleCategory(category.value)}
                disabled={disabled}
                className="pointer-events-none"
              />
              <Icon className={`h-4 w-4 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label
                htmlFor={category.value}
                className="flex-1 text-sm cursor-pointer"
              >
                {category.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
