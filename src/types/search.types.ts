/**
 * @file search.types.ts
 * @description Domain models and DTOs for Search and Discovery.
 * This module manages faceted filtering, sorting, autocomplete suggestions, 
 * and search result projections.
 */

// ==========================================
// 1. Sorting & Autocomplete
// ==========================================

/** Defines the available sorting strategies for search results. */
export type SortField = 
  "relevance" | "price_asc" | "price_desc" | 
  "rating" | "sold" | "newest" | "name_asc" | "discount";

/** Data structure for search-as-you-type (type-ahead) suggestions. */
export interface AutocompleteItem {
  _id: string;
  name: string;
  slug: string;
  /** Used by the frontend to render different icons or routing prefixes. */
  type: "product" | "brand" | "category";
}

// ==========================================
// 2. Search Results & Facets
// ==========================================

/** 
 * A light-weight projection of a Product for display in search grids. 
 * Fields are selected to minimize payload size while providing enough info for a product card.
 */
export interface SearchResultItem {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  category: { _id: string; name: string; slug: string };
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  rating: { average: number; count: number };
  soldCount: number;
  isFeatured: boolean;
  shortDescription?: string;
}

/** 
 * Aggregated data used to build filter sidebars (e.g., "Brands", "Price Range"). 
 */
export interface SearchFacets {
  brands: Array<{ brand: string; count: number }>;
  priceRange: { min: number; max: number; avg: number };
  ratings: Array<{ rating: number; count: number }>;
  totalInStock: number;
}

// ==========================================
// 3. Search Lifecycle (Params & Response)
// ==========================================

/** 
 * Parameters used to execute a search query. 
 * Designed to map directly to URL query strings for easy bookmarking/sharing.
 */
export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  sort?: SortField;
  page?: number;
  limit?: number;
  /** Whether to return aggregation data (facets) with the results. */
  facets?: boolean;
}

/**
 * The complete response object for a search query.
 */
export interface SearchResponse {
  success: boolean;
  message: string;
  products: SearchResultItem[];
  pagination: {
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number; 
    hasNext: boolean; 
    hasPrev: boolean;
  };
  /** Facets are optional; only returned if requested in SearchParams. */
  facets?: SearchFacets;
  /** Echoes the filters currently applied for UI state reconciliation. */
  appliedFilters: Partial<SearchParams>;
  query: { 
    keyword?: string; 
    sort: SortField; 
    /** Performance metric (in ms) to track search engine speed. */
    took: number; 
  };
}