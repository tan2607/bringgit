// busyPhoneNumbersCache.ts
const busyPhoneNumbers = new Set<string>();

export function markPhoneNumberBusy(phoneNumber: string) {
  busyPhoneNumbers.add(phoneNumber);
}

export function markPhoneNumberFree(phoneNumber: string) {
  busyPhoneNumbers.delete(phoneNumber);
}

export function isPhoneNumberBusy(phoneNumber: string): boolean {
  return busyPhoneNumbers.has(phoneNumber);
}

export function getBusyPhoneNumbers(): string[] {
  return Array.from(busyPhoneNumbers);
}