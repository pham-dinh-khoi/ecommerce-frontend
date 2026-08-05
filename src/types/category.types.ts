/**
 * @file category.types.ts
 * @description Domain models and Data Transfer Objects (DTOs) for the Category system.
 * This file handles hierarchical category structures and multipart form payloads.
 */

// ==========================================
// 1. Core Domain Models
// ==========================================

/**
 * Represents a simplified reference to a parent category.
 * Used for building breadcrumbs or hierarchy paths without deep-nesting data.
 */
export interface CategoryAncestor {
  /** Unique database identifier. */
  _id: string;

  /** Display name of the ancestor. */
  name: string;

  /** URL-friendly identifier for routing. */
  slug: string;
}

export interface CategoryImage {
  url: string;
  publicId: string;
}

/**
 * The main Category entity representing the hierarchical data structure.
 * This model supports recursive nesting via the 'children' property.
 */
export interface Category {
  /** Unique database identifier. */
  _id: string;

  /** Display name. */
  name: string;

  /** URL-friendly identifier. */
  slug: string;

  /** Optional descriptive text. */
  description?: string;

  /** Optional URL or path to the category image. */
  image?: CategoryImage;

  /** The ID of the parent category, or null if this is a top-level category. */
  parent: string | null;

  /** List of all ancestor categories for breadcrumb generation. */
  ancestors: CategoryAncestor[];

  /** The depth level of this category in the tree (e.g., 0 for root). */
  level: number;

  /** Operational status; controls visibility in the UI. */
  isActive: boolean;

  /** Numerical value for custom sorting/ordering. */
  sortOrder: number;

  /**
   * Optional nested children categories.
   * Enables deep tree rendering (e.g., recursive sidebar menus).
   */
  children?: Category[];

  /** ISO string for creation date. */
  createdAt: string;

  /** ISO string for the last modification date. */
  updatedAt: string;
}

// ==========================================
// 2. Request Payloads
// ==========================================

/**
 * Payload used for creating a new category.
 * Note: Uses 'File' type for the 'imageFile' field, intended for 'multipart/form-data' requests.
 */
export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parent?: string;
  sortOrder?: number;
  isActive?: boolean;

  /** The binary image file to be uploaded. */
  imageFile?: File;
}

/**
 * Payload used for updating an existing category.
 * Fields are optional to support PATCH requests (partial updates).
 */
export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  parent?: string;
  sortOrder?: number;
  isActive?: boolean;

  /** The binary image file to be uploaded for updating. */
  imageFile?: File;
}
