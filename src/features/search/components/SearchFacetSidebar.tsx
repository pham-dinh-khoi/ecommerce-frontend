import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { SearchFacets, SearchParams } from '@/types/search.types';

interface SearchFacetSidebarProps {
  facets?: SearchFacets;
  filters: SearchParams;
  onChange: (patch: Partial<SearchParams>) => void;
}

/**
 * SearchFacetSidebar component provides interactive controls to filter search results.
 * It uses the 'controlled component' pattern where filters are passed down via props,
 * and updates are propagated back via the 'onChange' callback.
 */
function SearchFacetSidebar({
  facets,
  filters,
  onChange,
}: SearchFacetSidebarProps) {
  // Extract selected brands to manage checkbox states
  const selectedBrands = filters.brand ?? [];

  /**
   * Toggles the presence of a brand in the filter list.
   * If the brand exists, it is removed; otherwise, it is added.
   */
  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];

    onChange({ brand: next.length ? next : undefined });
  };

  return (
    <div className="space-y-6">
      {/* 1. Brand Filter Section */}
      {facets && facets.brands.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">
            Thương hiệu
          </h3>
          <div className="space-y-1.5">
            {facets.brands.map((b) => (
              <label key={b.brand} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedBrands.includes(b.brand)}
                  onCheckedChange={() => toggleBrand(b.brand)}
                />
                <span className="flex-1 text-gray-700">{b.brand}</span>
                <span className="text-xs text-gray-400">({b.count})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 2. Price Range Filter Section */}
      {/* We use 'onBlur' instead of 'onChange' to prevent triggering API requests 
          on every keystroke, improving performance. */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">
          Khoảng giá
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            defaultValue={filters.minPrice}
            onBlur={(e) =>
              onChange({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Đến"
            defaultValue={filters.maxPrice}
            onBlur={(e) =>
              onChange({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
        </div>
        {facets && (
          <p className="mt-1 text-xs text-gray-400">
            Khoảng: {facets.priceRange.min.toLocaleString('vi-VN')}đ -{' '}
            {facets.priceRange.max.toLocaleString('vi-VN')}đ
          </p>
        )}
      </div>

      {/* 3. Rating Filter Section */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#1A1A1A]">Đánh giá</h3>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                onChange({
                  minRating: filters.minRating === star ? undefined : star,
                })
              }
              className={`flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm ${
                filters.minRating === star
                  ? 'bg-blue-50 text-[#0047AB]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }
                />
              ))}
              <span className="ml-1">trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Availability Toggle */}
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={filters.inStock === true}
          onCheckedChange={(checked) =>
            onChange({ inStock: checked === true ? true : undefined })
          }
        />
        <span className="text-gray-700">
          Còn hàng {facets && `(${facets.totalInStock})`}
        </span>
      </label>

      {/* 5. Reset Control */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() =>
          onChange({
            brand: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            minRating: undefined,
            inStock: undefined,
          })
        }
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
}

export default SearchFacetSidebar;
