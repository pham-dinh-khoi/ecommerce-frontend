/**
 * Configuration constant for the LocalStorage key.
 * Keeps the key naming consistent across read/write operations.
 */
const GUEST_ID_KEY = 'guestId';

/**
 * Retrieves the guest ID from localStorage.
 * If it doesn't exist, it generates a new UUID, saves it to localStorage,
 * and returns it.
 *
 * @returns {string} The existing or newly generated guest ID.
 */
export const getOrCreateGuestId = (): string => {
  // Attempt to fetch the ID from browser storage
  let guestId = localStorage.getItem(GUEST_ID_KEY);

  // If no ID exists, generate a cryptographically secure random UUID
  if (!guestId) {
    guestId = crypto.randomUUID();
    // Persist the new ID for future sessions
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
};

/**
 * Safely checks if a guest ID exists in localStorage.
 *
 * @returns {string | null} The ID if present, otherwise null.
 */
export const getGuestId = (): string | null => {
  return localStorage.getItem(GUEST_ID_KEY);
};

/**
 * Removes the guest ID from localStorage.
 * Useful for logout scenarios or resetting tracking data.
 */
export const clearGuestId = (): void => {
  localStorage.removeItem(GUEST_ID_KEY);
};
