import type { ProductVariant } from '@/types/product.types';

/**
 * Normalizes variant attributes into grouped options.
 *
 * Logic:
 * 1. Iterates through all variants and their specific attributes.
 * 2. Uses a 'Set' to automatically handle deduplication of attribute values.
 * 3. Converts the Sets back to Arrays for the final return object.
 *
 * @param variants - The full list of available product variants.
 * @returns A record where keys are attribute names (e.g., "Color") and values are unique arrays (e.g., ["Red", "Blue"]).
 */
export function extractAttributeGroups(
  variants: ProductVariant[]
): Record<string, string[]> {
  const groups: Record<string, Set<string>> = {};

  variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      // Initialize the Set if the attribute name hasn't been encountered yet
      if (!groups[attr.name]) groups[attr.name] = new Set();
      groups[attr.name].add(attr.value);
    });
  });

  // Convert Sets to Arrays for easier consumption in UI components (e.g., mapping to dropdowns)
  const result: Record<string, string[]> = {};
  Object.entries(groups).forEach(([name, valueSet]) => {
    result[name] = Array.from(valueSet);
  });
  return result;
}

/**
 * Searches for a specific variant that matches the user's selected combination.
 *
 * Logic:
 * - Uses 'every' to ensure that ALL selected attributes match the attributes found on the variant.
 * - This acts as a strict equality check for the chosen product configuration.
 *
 * @param variants - The full list of available product variants.
 * @param selected - The current key-value pair of user selections (e.g., { "Size": "M", "Color": "Blue" }).
 * @returns The matching variant object, or undefined if no exact match is found.
 */
export function findMatchingVariant(
  variants: ProductVariant[],
  selected: Record<string, string>
): ProductVariant | undefined {
  const selectedEntries = Object.entries(selected);

  // Guard clause: Return undefined if no selection has been made
  if (selectedEntries.length === 0) return undefined;

  return variants.find((variant) => {
    // Check if every selected attribute exists within the current variant's attributes
    return selectedEntries.every(([name, value]) =>
      variant.attributes.some(
        (attr) => attr.name === name && attr.value === value
      )
    );
  });
}

/**
 * Determines if a specific attribute value is valid based on existing selections.
 *
 * Logic:
 * - Performs a "what-if" analysis. It simulates a new selection by merging current choices
 *   with the proposed candidate (`testSelected`).
 * - Returns true if at least one variant exists that satisfies this configuration,
 *   which is critical for disabling invalid UI buttons (graying out unavailable combinations).
 *
 * @param variants - The full list of available product variants.
 * @param attrName - The category of the attribute being checked (e.g., "Color").
 * @param attrValue - The specific value being checked (e.g., "Red").
 * @param currentSelected - The existing selection state.
 * @returns Boolean indicating if this combination is achievable.
 */
export function isAttributeValueAvailable(
  variants: ProductVariant[],
  attrName: string,
  attrValue: string,
  currentSelected: Record<string, string>
): boolean {
  // Simulate the new selection state
  const testSelected = { ...currentSelected, [attrName]: attrValue };

  // Check if any variant exists that fulfills the full set of constraints
  return variants.some((variant) =>
    Object.entries(testSelected).every(([name, value]) =>
      variant.attributes.some(
        (attr) => attr.name === name && attr.value === value
      )
    )
  );
}
