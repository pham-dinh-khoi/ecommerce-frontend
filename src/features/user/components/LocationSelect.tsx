import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locationService } from '@/services/locationService';
import type { Province, District, Ward } from '@/types/location.types';

/**
 * Interface for the LocationSelect component props.
 * Handles three-tier location cascading (Province -> District -> Ward).
 */
interface LocationSelectProps {
  province: string;
  district: string;
  ward: string;
  onChange: (values: {
    province: string;
    district: string;
    ward: string;
  }) => void;
}

/**
 * LocationSelect Component
 *
 * Manages fetching and displaying hierarchical location data.
 * When a parent level is changed, dependent child levels are reset and re-fetched.
 */
function LocationSelect({
  province,
  district,
  ward,
  onChange,
}: LocationSelectProps) {
  // --- Data State ---
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // --- UI Loading States ---
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // --- Effects ---

  // Load initial province list on mount
  useEffect(() => {
    locationService.getProvinces().then(setProvinces).catch(console.error);
  }, []);

  // --- Handlers ---

  /**
   * Triggers when a province is selected.
   * Resets District and Ward fields and initiates District fetch.
   */
  const handleProvinceChange = async (provinceName: string) => {
    onChange({ province: provinceName, district: '', ward: '' });
    setDistricts([]);
    setWards([]);

    const selected = provinces.find((p) => p.name === provinceName);
    if (!selected) return;

    setLoadingDistricts(true);
    try {
      const data = await locationService.getDistrictsByProvince(selected.code);
      setDistricts(data);
    } catch {
      // Silently fail: dropdown remains empty, allowing retry
    } finally {
      setLoadingDistricts(false);
    }
  };

  /**
   * Triggers when a district is selected.
   * Resets Ward field and initiates Ward fetch.
   */
  const handleDistrictChange = async (districtName: string) => {
    onChange({ province, district: districtName, ward: '' });
    setWards([]);

    const selected = districts.find((d) => d.name === districtName);
    if (!selected) return;

    setLoadingWards(true);
    try {
      const data = await locationService.getWardsByDistrict(selected.code);
      setWards(data);
    } catch {
      // Silently fail
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardChange = (wardName: string) => {
    onChange({ province, district, ward: wardName });
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Province Selector */}
      <Select
        value={province || undefined}
        onValueChange={(val) => val && handleProvinceChange(val)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tỉnh/Thành phố">
            {(val: string) => val}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {provinces.map((p) => (
            <SelectItem key={p.code} value={p.name}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* District Selector - Disabled if no province is selected */}
      <Select
        value={district || undefined}
        onValueChange={(val) => val && handleDistrictChange(val)}
        disabled={!province || loadingDistricts}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={loadingDistricts ? 'Đang tải...' : 'Quận/Huyện'}
          >
            {(val: string) => val}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {districts.map((d) => (
            <SelectItem key={d.code} value={d.name}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Ward Selector - Disabled if no district is selected */}
      <Select
        value={ward || undefined}
        onValueChange={(val) => val && handleWardChange(val)}
        disabled={!district || loadingWards}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loadingWards ? 'Đang tải...' : 'Phường/Xã'}>
            {(val: string) => val}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {wards.map((w) => (
            <SelectItem key={w.code} value={w.name}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LocationSelect;
