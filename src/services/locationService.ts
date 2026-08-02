/**
 * src/services/locationService.ts
 * 
 * Service module for fetching Vietnamese administrative units (Provinces, Districts, Wards).
 * 
 * Note: We utilize native `fetch` instead of the global `axiosInstance` because:
 * 1. It is a public API (third-party domain).
 * 2. It does not require our internal JWT/Auth headers.
 * 3. It prevents potential interceptor conflicts.
 */

import type { Province, District, Ward } from '@/types/location.types';

const LOCATION_API_BASE = 'https://provinces.open-api.vn/api';

export const locationService = {
  
  /**
   * Fetches the list of all provinces in Vietnam.
   * @returns {Promise<Province[]>} An array of province objects.
   * @throws {Error} If the API request fails.
   */
  getProvinces: async (): Promise<Province[]> => {
    const res = await fetch(`${LOCATION_API_BASE}/p/`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch provinces list');
    }
    
    return res.json();
  },

  /**
   * Fetches the list of districts for a specific province.
   * @param {number} provinceCode - The unique identifier of the province.
   * @returns {Promise<District[]>} An array of district objects.
   * @throws {Error} If the API request fails.
   */
  getDistrictsByProvince: async (provinceCode: number): Promise<District[]> => {
    // The 'depth=2' parameter ensures we retrieve deeper relationship data if needed
    const res = await fetch(`${LOCATION_API_BASE}/p/${provinceCode}?depth=2`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch districts list');
    }
    
    const data = await res.json();
    return data.districts ?? [];
  },

  /**
   * Fetches the list of wards for a specific district.
   * @param {number} districtCode - The unique identifier of the district.
   * @returns {Promise<Ward[]>} An array of ward objects.
   * @throws {Error} If the API request fails.
   */
  getWardsByDistrict: async (districtCode: number): Promise<Ward[]> => {
    // Similarly, 'depth=2' is used to maintain consistency in data retrieval
    const res = await fetch(`${LOCATION_API_BASE}/d/${districtCode}?depth=2`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch wards list');
    }
    
    const data = await res.json();
    return data.wards ?? [];
  },
};