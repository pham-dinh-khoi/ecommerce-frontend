import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { VariantAttribute } from '@/types/product.types';

// =============================================================================
// Interfaces
// =============================================================================

interface VariantAttributesInputProps {
  /** Array of current attribute pairs (name/value) */
  attributes: VariantAttribute[];
  /** Callback triggered when the attribute list changes */
  onChange: (attributes: VariantAttribute[]) => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * VariantAttributesInput Component
 *
 * Provides a dynamic form interface to manage product variant attributes (e.g., Color: Red, Size: XL).
 * Allows users to add, remove, and update specific attribute pairs.
 */
function VariantAttributesInput({
  attributes,
  onChange,
}: VariantAttributesInputProps) {
  /**
   * Appends a new empty attribute object to the list.
   */
  const handleAdd = () => {
    onChange([...attributes, { name: '', value: '' }]);
  };

  /**
   * Removes an attribute at the specified index from the list.
   */
  const handleRemove = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index));
  };

  /**
   * Updates a specific field (name or value) for an attribute at a given index.
   * Utilizes immutability to ensure React state updates correctly.
   */
  const handleChange = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value } as VariantAttribute;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {/* Map through existing attributes to render inputs */}
      {attributes.map((attr, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {/* Attribute Name Input */}
          <Input
            placeholder="Tên thuộc tính (VD: Màu sắc)"
            value={attr.name}
            onChange={(e) => handleChange(idx, 'name', e.target.value)}
            className="flex-1"
          />

          {/* Attribute Value Input */}
          <Input
            placeholder="Giá trị (VD: Đỏ)"
            value={attr.value}
            onChange={(e) => handleChange(idx, 'value', e.target.value)}
            className="flex-1"
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="shrink-0 text-red-500 hover:text-red-600"
          >
            <X size={18} />
          </button>
        </div>
      ))}

      {/* Button to append a new attribute row */}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <Plus size={14} className="mr-1" />
        Thêm thuộc tính
      </Button>
    </div>
  );
}

export default VariantAttributesInput;
