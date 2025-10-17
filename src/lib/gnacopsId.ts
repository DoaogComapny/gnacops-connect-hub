// Utility functions for GNACOPS ID generation

export type MembershipCategory = 'prime' | 'associate';

export const membershipCategories = {
  'Institutional Membership': 'prime',
  'Proprietor': 'prime',
  'Teacher Council': 'associate',
  'Parent Council': 'associate',
  'Service Provider': 'associate',
  'Non-Teaching Staff': 'associate',
} as const;

export const regionNumbers: Record<string, string> = {
  'Greater Accra': '01',
  'Ashanti': '02',
  'Western': '03',
  'Eastern': '04',
  'Central': '05',
  'Northern': '06',
  'Upper East': '07',
  'Upper West': '08',
  'Volta': '09',
  'Brong Ahafo': '10',
  'Bono East': '11',
  'Ahafo': '12',
  'Savannah': '13',
  'North East': '14',
  'Oti': '15',
  'Western North': '16',
};

/**
 * Generates a GNACOPS ID in the format: GNC/[PM|AM]/[region_number]/[serial_number]
 * @param membershipType - The type of membership
 * @param region - The region name
 * @param serialNumber - The user's serial number (will be padded to 4 digits)
 * @returns The formatted GNACOPS ID
 */
export function generateGnacopsId(
  membershipType: keyof typeof membershipCategories,
  region: string,
  serialNumber: number
): string {
  const category = membershipCategories[membershipType];
  const categoryCode = category === 'prime' ? 'PM' : 'AM';
  const regionCode = regionNumbers[region] || '00';
  const paddedSerial = String(serialNumber).padStart(4, '0');
  
  return `GNC/${categoryCode}/${regionCode}/${paddedSerial}`;
}

/**
 * Get the category code (PM or AM) for a membership type
 */
export function getCategoryCode(membershipType: keyof typeof membershipCategories): 'PM' | 'AM' {
  return membershipCategories[membershipType] === 'prime' ? 'PM' : 'AM';
}

/**
 * Check if a membership type is prime
 */
export function isPrimeMembership(membershipType: string): boolean {
  return membershipCategories[membershipType as keyof typeof membershipCategories] === 'prime';
}
