import { describe, it, expect } from 'vitest';
import {
  extractAttributeGroups,
  findMatchingVariant,
  resolveSelectionForAttribute,
} from './variantMatcher';
import type { ProductVariant } from '@/types/product.types';

// Shared fixture: a product with an intentionally UNEVEN attribute matrix.
// Orange only comes in XL — this is the exact combination that caused
// the historical "deadlock" bug (both buttons ending up disabled).
const variants: ProductVariant[] = [
  {
    _id: 'v1',
    sku: 'SHIRT-RED-M',
    attributes: [
      { name: 'Color', value: 'Red' },
      { name: 'Size', value: 'M' },
    ],
    price: 100000,
    stock: 5,
    images: [],
    isActive: true,
  },
  {
    _id: 'v2',
    sku: 'SHIRT-BLUE-M',
    attributes: [
      { name: 'Color', value: 'Blue' },
      { name: 'Size', value: 'M' },
    ],
    price: 100000,
    stock: 5,
    images: [],
    isActive: true,
  },
  {
    _id: 'v3',
    sku: 'SHIRT-YELLOW-M',
    attributes: [
      { name: 'Color', value: 'Yellow' },
      { name: 'Size', value: 'M' },
    ],
    price: 100000,
    stock: 5,
    images: [],
    isActive: true,
  },
  {
    _id: 'v4',
    sku: 'SHIRT-ORANGE-XL',
    attributes: [
      { name: 'Color', value: 'Orange' },
      { name: 'Size', value: 'XL' },
    ],
    price: 110000,
    stock: 3,
    images: [],
    isActive: true,
  },
];

describe('extractAttributeGroups', () => {
  it('groups all unique attribute values by attribute name', () => {
    const result = extractAttributeGroups(variants);

    expect(result.Color).toEqual(
      expect.arrayContaining(['Red', 'Blue', 'Yellow', 'Orange'])
    );
    expect(result.Size).toEqual(expect.arrayContaining(['M', 'XL']));
  });

  it('returns an empty object when given no variants', () => {
    expect(extractAttributeGroups([])).toEqual({});
  });
});

describe('findMatchingVariant', () => {
  it('finds the exact variant matching a full attribute selection', () => {
    const result = findMatchingVariant(variants, { Color: 'Red', Size: 'M' });
    expect(result?.sku).toBe('SHIRT-RED-M');
  });

  it('returns undefined when no variant matches the given combination', () => {
    // Red + XL does not exist in the fixture
    const result = findMatchingVariant(variants, { Color: 'Red', Size: 'XL' });
    expect(result).toBeUndefined();
  });

  it('returns undefined when no selection is provided', () => {
    expect(findMatchingVariant(variants, {})).toBeUndefined();
  });
});

describe('resolveSelectionForAttribute (deadlock regression test)', () => {
  it('keeps the other selected attribute unchanged when the full combination already exists', () => {
    // Currently on Red + M, picking Blue -> Blue + M exists, so Size should stay M
    const result = resolveSelectionForAttribute(variants, 'Color', 'Blue', {
      Color: 'Red',
      Size: 'M',
    });

    expect(result).toEqual({ Color: 'Blue', Size: 'M' });
  });

  /**
   * This is the core regression test for the historical deadlock bug.
   *
   * Bug history: when a user had "Yellow + M" selected and clicked "Orange"
   * (which only exists as "Orange + XL"), the old implementation disabled
   * the "Orange" button because "Orange + M" didn't exist. Symmetrically,
   * "XL" was disabled because "XL" alongside the current color didn't exist
   * either — leaving the user with no way to select the Orange variant at all.
   *
   * The fix: instead of disabling incompatible combinations, automatically
   * resolve to the nearest valid variant and override the conflicting
   * attribute (Size, in this case).
   */
  it('automatically switches the other attribute instead of returning null when the exact combination does not exist', () => {
    const result = resolveSelectionForAttribute(variants, 'Color', 'Orange', {
      Color: 'Yellow',
      Size: 'M',
    });

    // Size must be auto-corrected to XL — the user must NEVER end up stuck
    expect(result).toEqual({ Color: 'Orange', Size: 'XL' });
  });

  it('returns null when the picked value does not exist in any variant at all', () => {
    const result = resolveSelectionForAttribute(variants, 'Color', 'Purple', {
      Color: 'Yellow',
      Size: 'M',
    });

    expect(result).toBeNull();
  });

  it('resolves a full selection correctly even when starting from an empty selection', () => {
    const result = resolveSelectionForAttribute(variants, 'Size', 'XL', {});

    expect(result).toEqual({ Color: 'Orange', Size: 'XL' });
  });
});
