import { Clinic, ClinicWithDistance, Coordinates } from '~/types/clinic'
import clinicsData from '../data/clinics.json'

// Get clinics data
export const clinics: Clinic[] = clinicsData.clinics

const config = useRuntimeConfig()

// Haversine formula to calculate distance between two lat/lon points in kilometers
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const toRad = (val: number): number => (val * Math.PI) / 180
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLon = toRad(coord2.lon - coord1.lon)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in km
}

// Mock geocoding function - replace with actual API call in production
export async function getCoordinatesFromPostalCode(postalCode: string): Promise<Coordinates> {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}+Singapore&key=${config.public.googleApiKey}`);
  const data = await response.json();

  console.log(data)
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lon: location.lng };
  } else {
    throw new Error('Could not geocode postal code');
  }
}

export async function findNearestClinics(
  postalCode: string,
  limit: number = 3
): Promise<ClinicWithDistance[]> {
  // Get coordinates of input postal code
  const userCoords = await getCoordinatesFromPostalCode(postalCode)

  // Calculate distance for each clinic and store it
  const clinicsWithDistance = clinics.map(clinic => ({
    ...clinic,
    distance: calculateDistance(userCoords, clinic)
  }))

  // Sort clinics by distance
  clinicsWithDistance.sort((a, b) => a.distance - b.distance)

  // Return the nearest 'limit' number of clinics
  return clinicsWithDistance.slice(0, limit)
}
