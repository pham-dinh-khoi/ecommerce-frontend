import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductQueryParams } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

/**
 * Defines the supported sorting keys available in the UI.
 * This union type ensures strict type checking across the component.
 */
export type SortOption =
  'newest' | 'price-asc' | 'price-desc' | 'rating' | 'bestseller';

interface ProductSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

// ==========================================
// Constants & Configuration
// ==========================================

/**
 * Single source of truth for sorting options.
 * Defined outside the component to prevent re-instantiation on every render.
 */
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
];

// ==========================================
// Components
// ==========================================

/**
 * A controlled UI component for selecting product sorting criteria.
 *
 * @param {SortOption} value - The current selected sorting key.
 * @param {(value: SortOption) => void} onChange - Callback triggered when the selection changes.
 */
function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <Select
      value={value}
      // Cast the string value from the UI event to our strict SortOption type
      onValueChange={(val) => val && onChange(val as SortOption)}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Sắp xếp">
          {/* 
            Dynamically resolve the display label based on the current value.
            This ensures the UI stays in sync with the internal state. 
          */}
          {(val: string) =>
            sortOptions.find((s) => s.value === val)?.label ?? ''
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ProductSortSelect;

// ==========================================
// Utility Functions
// ==========================================

/**
 * Adapter function to map internal UI sort keys to API-compatible query parameters.
 *
 * This keeps the API logic decoupled from the UI selection keys, allowing
 * us to change the API contract without breaking the UI component.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function sortOptionToParams(sort: SortOption): {
  sort: ProductQueryParams['sort'];
  order: 'asc' | 'desc';
} {
  switch (sort) {
    case 'price-asc':
      return { sort: 'minPrice', order: 'asc' };
    case 'price-desc':
      return { sort: 'minPrice', order: 'desc' };
    case 'rating':
      return { sort: 'rating', order: 'desc' };
    case 'bestseller':
      return { sort: 'soldCount', order: 'desc' };
    default:
      // Default case handles 'newest'
      return { sort: 'createdAt', order: 'desc' };
  }
}
