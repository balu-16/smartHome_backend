/**
 * Validate Indian phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
  const indianMobileRegex = /^[6-9]\d{9}$/;
  return indianMobileRegex.test(cleanNumber);
}

/**
 * Format phone number by removing country code if present
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleanNumber = phoneNumber.replace(/[\s\-\+]/g, '');
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    return cleanNumber.substring(2);
  }
  return cleanNumber;
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
