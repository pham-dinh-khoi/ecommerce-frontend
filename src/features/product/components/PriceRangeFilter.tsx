import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ==========================================
// Types & Interfaces
// ==========================================

interface PriceRangeFilterProps {
  /** Callback triggered when the user applies the filter. Returns min/max values as numbers or undefined if empty. */
  onApply: (min: number | undefined, max: number | undefined) => void;
}

// ==========================================
// Component
// ==========================================

/**
 * PriceRangeFilter
 * A UI component that allows users to filter items based on a price range (min/max).
 */
function PriceRangeFilter({ onApply }: PriceRangeFilterProps) {
  // --- Local State ---
  // Using strings for inputs to handle empty states easily before conversion
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // --- Handlers ---

  /**
   * Converts the input strings to numbers and triggers the onApply callback.
   * If the input is empty, passes 'undefined' to the parent.
   */
  const handleApply = () => {
    onApply(min ? Number(min) : undefined, max ? Number(max) : undefined);
  };

  // --- Render ---
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">Khoảng giá</h3>

      <div className="flex items-center gap-2">
        {/* Minimum Price Input */}
        <Input
          type="number"
          placeholder="Từ"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="h-9"
        />

        {/* Separator */}
        <span className="text-gray-400">-</span>

        {/* Maximum Price Input */}
        <Input
          type="number"
          placeholder="Đến"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Action Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleApply}
        className="mt-2 w-full"
      >
        Áp dụng
      </Button>
    </div>
  );
}

export default PriceRangeFilter;
