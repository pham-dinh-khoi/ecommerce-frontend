import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Tag, FolderTree } from 'lucide-react';

// --- Internal Utilities & Types ---
import { searchService } from '@/features/search/searchService';
import { useDebounce } from '@/hooks/useDebounce';
import { buildProductUrl, buildSearchUrl } from '@/constants/routes';
import type { AutocompleteItem } from '@/types/search.types';

// Map icon components to item types to prevent logic duplication in the render loop.
// Hoisting this outside the component improves performance as it isn't redefined on every render.
const ICON_MAP = {
  product: Package,
  brand: Tag,
  category: FolderTree,
};

function SearchAutocomplete() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the query to prevent excessive API calls while the user is typing
  const debouncedQuery = useDebounce(query, 300);

  // --- Effects ---

  // Effect: Fetch data based on debounced input
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) return;

    // The 'cancelled' flag handles the race condition:
    // If the component unmounts or the query changes before the API returns,
    // we ignore the outdated response.
    let cancelled = false;

    searchService
      .autocomplete(debouncedQuery.trim())
      .then((res) => {
        if (!cancelled) setSuggestions(res.data);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Effect: Close the dropdown when the user clicks outside the component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup: Remove listener to prevent memory leaks
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(buildSearchUrl(query.trim()));
  };

  const handleSelectSuggestion = (item: AutocompleteItem) => {
    setIsOpen(false);
    setQuery('');

    // Determine navigation path based on the type of result selected
    if (item.type === 'product') {
      navigate(buildProductUrl(item.slug));
    } else if (item.type === 'brand') {
      navigate(buildSearchUrl(item.name));
    } else {
      // Assuming 'category' fallback
      navigate(buildSearchUrl('', item._id));
    }
  };

  // Determine which suggestions to display (filter out short queries)
  const visibleSuggestions =
    debouncedQuery.trim().length < 2 ? [] : suggestions;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            id="header-search-autocomplete"
            name="search"
            autoComplete="off"
            aria-label="Tìm kiếm sản phẩm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-[#0047AB] focus:outline-none"
          />
        </div>
      </form>

      {/* Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border border-gray-100 bg-white shadow-lg">
          {visibleSuggestions.map((item) => {
            const Icon = ICON_MAP[item.type];
            return (
              <button
                key={`${item.type}-${item._id}`}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
              >
                <Icon size={14} className="shrink-0 text-gray-400" />
                <span className="flex-1 truncate text-[#1A1A1A]">
                  {item.name}
                </span>
                {item.type !== 'product' && (
                  <span className="shrink-0 text-xs text-gray-400">
                    {item.type === 'brand' ? 'Thương hiệu' : 'Danh mục'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
