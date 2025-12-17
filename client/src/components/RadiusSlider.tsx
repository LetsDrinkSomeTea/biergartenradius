import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function RadiusSlider({ 
  value, 
  onChange, 
  min = 500, 
  max = 5000,
  disabled 
}: RadiusSliderProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      const clampedValue = Math.min(Math.max(newValue, min), max);
      onChange(clampedValue);
    }
  };

  const formatValue = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm font-medium">Suchradius</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={100}
            className="w-20 h-8 text-sm text-right font-mono"
            disabled={disabled}
            data-testid="input-radius-value"
          />
          <span className="text-sm text-muted-foreground w-6">m</span>
        </div>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={100}
        disabled={disabled}
        data-testid="slider-radius"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span className="font-medium text-foreground">{formatValue(value)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
