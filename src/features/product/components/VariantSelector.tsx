import {
  extractAttributeGroups,
  resolveSelectionForAttribute,
} from '@/features/product/utils/variantMatcher';
import type { ProductVariant } from '@/types/product.types';

// =============================================================================
// Interfaces
// =============================================================================

interface VariantSelectorProps {
  /** Array of product variants to render */
  variants: ProductVariant[];
  /** Object representing currently selected attributes (e.g., { Color: 'Red' }) */
  selected: Record<string, string>;
  /** Callback triggered when a user selects a variant option */
  onChange: (newSelected: Record<string, string>) => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * VariantSelector Component
 *
 * Responsible for rendering selectable attributes (e.g., Size, Color) for a product.
 * It manages the visual state of buttons based on availability (derived from the `variants` data)
 * and the user's current selection.
 */
function VariantSelector({
  variants,
  selected,
  onChange,
}: VariantSelectorProps) {
  // 1. Filter out inactive variants before processing to ensure users only see available/valid options
  const activeVariants = variants.filter((v) => v.isActive);

  // 2. Group variants by attribute type (e.g., Size -> [S, M, L], Color -> [Red, Blue])
  const groups = extractAttributeGroups(activeVariants);

  const handleSelect = (attrName: string, value: string) => {
    const resolved = resolveSelectionForAttribute(
      activeVariants,
      attrName,
      value,
      selected
    );
    if (resolved) onChange(resolved);
  };

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([attrName, values]) => (
        <div key={attrName}>
          {/* Attribute Group Label */}
          <span className="text-sm font-medium text-[#1A1A1A]">{attrName}</span>

          <div className="mt-2 flex flex-wrap gap-2">
            {values.map((value) => {
              // 3. Determine UI states for the specific button
              const isSelected = selected[attrName] === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(attrName, value)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-[#0047AB] bg-[#0047AB] text-white'
                      : 'border-gray-300 text-[#1A1A1A] hover:border-[#0047AB]'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VariantSelector;
