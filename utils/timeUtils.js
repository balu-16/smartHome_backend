// Time utility functions for Indian Standard Time (IST)

/**
 * Get current IST timestamp as ISO string
 * @returns {string} ISO string in IST timezone
 */
export function getISTTimestamp() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString();
}

/**
 * Get IST timestamp for a specific date
 * @param {Date} date - The date to convert
 * @returns {string} ISO string in IST timezone
 */
export function toISTTimestamp(date) {
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(date.getTime() + istOffset);
  return istTime.toISOString();
}

/**
 * Format IST timestamp for display
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted IST time string
 */
export function formatISTTime(timestamp) {
  const date = new Date(timestamp);
  // Convert to IST for display
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-IN', options);
}

/**
 * Get IST timestamp for OTP expiration (10 minutes from now)
 * @returns {string} ISO string for OTP expiration in IST
 */
export function getOTPExpirationIST() {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
  return toISTTimestamp(expirationTime);
}

/**
 * Get current IST timestamp for comparison (used in OTP verification)
 * @returns {string} ISO string in IST timezone for current time
 */
export function getCurrentISTForComparison() {
  return getISTTimestamp();
}