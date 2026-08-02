import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// Shadcn UI Components
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
import type { AdminUserQueryParams, UserRole } from '@/types/user.types';

/**
 * Props definition for the UserFilterBar component.
 * Uses a callback pattern to bubble up filter changes to the parent component.
 */
interface UserFilterBarProps {
  onFilterChange: (filters: Partial<AdminUserQueryParams>) => void;
}

/**
 * Static configuration objects.
 * Separating these constants outside the component prevents them from being
 * re-initialized on every render cycle, improving performance.
 */
const roleOptions = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Admin' },
  { value: 'seller', label: 'Seller' },
  { value: 'user', label: 'User' },
];

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã khóa' },
];

function UserFilterBar({ onFilterChange }: UserFilterBarProps) {
  // --- State Management ---
  // Using local state to manage inputs before debouncing them to the parent.
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  // --- Side Effects ---
  /**
   * Debounce Effect:
   * Prevents excessive API calls or heavy re-renders by delaying the filter action.
   * It waits 400ms after the last user interaction before executing the callback.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        keyword: keyword.trim() || undefined,
        role: role === 'all' ? undefined : (role as UserRole),
        isActive: status === 'all' ? undefined : status === 'true',
      });
    }, 400);

    // Cleanup function: clears the timer on every re-render or unmount.
    // This is critical to prevent race conditions.
    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, role, status]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search Input Section */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Role Selection Dropdown */}
      <Select value={role} onValueChange={(val) => val && setRole(val)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Vai trò">
            {/* Functional render pattern for Shadcn/Radix UI Select */}
            {(val: string) =>
              roleOptions.find((r) => r.value === val)?.label ?? ''
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Selection Dropdown */}
      <Select value={status} onValueChange={(val) => val && setStatus(val)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Trạng thái">
            {/* Maps the value state to the human-readable label */}
            {(val: string) =>
              statusOptions.find((s) => s.value === val)?.label ?? ''
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default UserFilterBar;
