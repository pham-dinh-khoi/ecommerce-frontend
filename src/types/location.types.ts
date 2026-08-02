/**
 * @file location.types.ts
 * @description Administrative division models for Vietnam.
 * These interfaces support hierarchical data fetching for address selection (Province -> District -> Ward).
 */

/**
 * Represents a province or city (Level 1).
 * Can optionally contain a list of nested districts.
 */
export interface Province {
  /** Unique administrative code for the province. */
  code: number;

  /** Display name of the province. */
  name: string;

  /** 
   * Optional nested list of districts.
   * Useful when pre-fetching the full location tree.
   */
  districts?: District[];
}

/**
 * Represents a district or urban/rural district (Level 2).
 * Belongs to a parent province.
 */
export interface District {
  /** Unique administrative code for the district. */
  code: number;

  /** Display name of the district. */
  name: string;

  /** 
   * Optional nested list of wards.
   * Typically populated after a user selects a specific district.
   */
  wards?: Ward[];
}

/**
 * Represents a ward, commune, or town (Level 3).
 * The lowest level of the address selection hierarchy.
 */
export interface Ward {
  /** Unique administrative code for the ward. */
  code: number;

  /** Display name of the ward. */
  name: string;
}