import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge and resolve Tailwind CSS classes.
 *
 * This function combines `clsx` (for conditional class toggling)
 * and `tailwind-merge` (for resolving Tailwind CSS class conflicts).
 *
 * @param inputs - A variable number of class values (strings, objects, arrays, or undefined/null).
 * @returns A single, resolved string of CSS classes ready to be passed to the className attribute.
 */
export function cn(...inputs: ClassValue[]) {
  // 1. clsx(inputs) evaluates the inputs, filtering out falsy values (false, null, undefined)
  //    and flattening object/array structures into a single string.

  // 2. twMerge(...) processes the output from clsx. It identifies Tailwind class conflicts
  //    (e.g., 'p-2' vs 'p-4') and ensures the final class list is clean and follows
  //    proper CSS priority rules.
  return twMerge(clsx(inputs));
}
