const PENDING_ORDER_KEY = "pendingPaypalOrderId";

/**
 * Lưu lại orderId NGAY TRƯỚC khi redirect sang PayPal — dùng sessionStorage
 * vì React state sẽ bị hủy hoàn toàn khi window.location.href chuyển trang.
 * sessionStorage tồn tại xuyên suốt phiên làm việc của tab, mất khi đóng tab.
 */
export const savePendingOrder = (orderId: string): void => {
  sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
};

export const getPendingOrder = (): string | null => {
  return sessionStorage.getItem(PENDING_ORDER_KEY);
};

export const clearPendingOrder = (): void => {
  sessionStorage.removeItem(PENDING_ORDER_KEY);
};