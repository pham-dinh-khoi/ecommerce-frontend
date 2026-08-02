import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductQueryParams, ProductStatus } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface ProductFilterBarProps {
  onFilterChange: (filters: Partial<ProductQueryParams>) => void;
}

// ==========================================
// Constants & Configuration
// ==========================================

/**
 * Defines the static filter options for product status.
 * Defined outside the component to prevent re-instantiation.
 */
const statusFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
  { value: 'archived', label: 'Lưu trữ' },
];

// ==========================================
// Component
// ==========================================

function ProductFilterBar({ onFilterChange }: ProductFilterBarProps) {
  // --- State Management ---
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');

  // --- Effects ---

  /**
   * Debounced filter execution.
   * This effect waits for 400ms of inactivity before triggering the onFilterChange callback.
   * This prevents excessive API requests while the user is actively typing.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        keyword: keyword.trim() || undefined,
        status: status === 'all' ? undefined : (status as ProductStatus),
      });
    }, 400);

    // Cleanup function: clears the timer if the user types again before the 400ms limit
    return () => clearTimeout(timer);
  }, [keyword, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Render ---
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Input with Icon */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter Dropdown */}
      <Select
        value={status}
        onValueChange={(val) => {
          if (val) setStatus(val);
        }}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Trạng thái">
            {(val: string) =>
              statusFilterOptions.find((s) => s.value === val)?.label ?? ''
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusFilterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ProductFilterBar;
