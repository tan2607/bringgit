const busyPhoneNumbers = new Map<string, number>(); // Map<phoneNumber, expireTimestamp>

const DEFAULT_TTL = 60 * 1000; // 60 seconds

export function markPhoneNumberBusy(phoneNumber: string, ttl: number = DEFAULT_TTL) {
  const expireAt = Date.now() + ttl;
  busyPhoneNumbers.set(phoneNumber, expireAt);
}

export function markPhoneNumberFree(phoneNumber: string) {
  busyPhoneNumbers.delete(phoneNumber);
}

export function isPhoneNumberBusy(phoneNumber: string): boolean {
  const expireAt = busyPhoneNumbers.get(phoneNumber);
  if (!expireAt) return false;

  if (Date.now() > expireAt) {
    busyPhoneNumbers.delete(phoneNumber);
    return false;
  }

  return true;
}

export function getBusyPhoneNumbers(): string[] {
  const now = Date.now();
  const validEntries = Array.from(busyPhoneNumbers.entries()).filter(([_, expireAt]) => expireAt > now);
  for (const [phoneNumber, expireAt] of busyPhoneNumbers.entries()) {
    if (expireAt <= now) busyPhoneNumbers.delete(phoneNumber);
  }
  return validEntries.map(([phoneNumber]) => phoneNumber);
}
