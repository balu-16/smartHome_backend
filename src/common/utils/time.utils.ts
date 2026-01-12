/**
 * Get current IST timestamp as ISO string
 */
export function getISTTimestamp(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString();
}

/**
 * Get IST timestamp for a specific date
 */
export function toISTTimestamp(date: Date): string {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  return istTime.toISOString();
}

/**
 * Get IST timestamp for OTP expiration (10 minutes from now)
 */
export function getOTPExpirationIST(): Date {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 10 * 60 * 1000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(expirationTime.getTime() + istOffset);
}

/**
 * Get current IST Date for comparison
 */
export function getCurrentISTDate(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
}
