import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';

// Store & Actions
import { useAppDispatch } from '@/store/hooks';
import {
  updateAvatarThunk,
  deleteAvatarThunk,
} from '@/features/user/userSlice';

// Types
import type { UserAvatar } from '@/types/user.types';

/**
 * Configuration Constants
 * Defined outside the component to prevent re-instantiation on render.
 */
const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface AvatarUploaderProps {
  avatar?: UserAvatar;
  name: string;
}

/**
 * AvatarUploader Component
 *
 * Handles the display of the user's avatar, provides a trigger to upload
 * a new image, and allows the removal of the existing avatar.
 */
function AvatarUploader({ avatar, name }: AvatarUploaderProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Validates and dispatches the file upload process.
   * Performs client-side checks for file type and size before API request.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation checks
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Chỉ chấp nhận ảnh JPEG, PNG, WebP');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Ảnh không được vượt quá 2MB');
      return;
    }

    setIsUploading(true);
    try {
      await dispatch(updateAvatarThunk(file)).unwrap();
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setIsUploading(false);
      // Reset input value to allow the same file to be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Dispatches the action to remove the current avatar from the profile.
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAvatarThunk()).unwrap();
      toast.success('Đã xóa ảnh đại diện');
    } catch (err) {
      if (err) toast.error(err as string);
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate fallback initials for users without an avatar
  const initials = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Display & Edit Trigger */}
      <div className="relative">
        {avatar?.url ? (
          <img
            src={avatar.url}
            alt={name}
            className="h-20 w-20 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0047AB] text-2xl font-medium text-white">
            {initials}
          </div>
        )}

        {/* Upload Trigger (Hidden input proxy) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 text-gray-600 shadow-md hover:text-[#0047AB] disabled:opacity-50"
          title="Đổi ảnh đại diện"
        >
          <Camera size={14} />
        </button>

        {/* Invisible File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Delete Option */}
      {avatar?.url && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1 text-sm text-red-500 hover:underline disabled:opacity-50"
        >
          <X size={14} />
          Xóa ảnh
        </button>
      )}

      {/* Loading Indicator */}
      {isUploading && (
        <span className="text-sm text-gray-400">Đang tải lên...</span>
      )}
    </div>
  );
}

export default AvatarUploader;
