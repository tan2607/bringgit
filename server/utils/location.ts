import { Clinic, ClinicWithDistance, Coordinates } from '~/types/clinic'
import clinicsData from '../data/clinics.json'
import fs from 'fs'

// Get clinics data
export const clinics: Clinic[] = clinicsData

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

// Geocoding function that accepts any search query
export async function getCoordinatesFromQuery(query: string): Promise<Coordinates> {
  const encodedQuery = encodeURIComponent(`${query}, Singapore`);
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${config.public.googleApiKey}`);
  const data = await response.json();

  
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lon: location.lng };
  } else {
    console.log(data)
    return { lat: 0, lon: 0 };
  }
}

export async function findNearestClinics(
  searchQuery: string,
  limit: number = 3
): Promise<ClinicWithDistance[]> {
  // Get coordinates of input search query
  const userCoords = await getCoordinatesFromQuery(searchQuery)

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

// let running = false;
// // Geocode clinic list
// export async function geocodeClinics(): Promise<ClinicWithDistance[]> {
//   if (running) return;
//   running = true;

//   const clinicsWithoutLatLon = clinics.filter(clinic => !clinic.lat || !clinic.lon)
//   const clinicsWithLatLon = clinics.filter(clinic => clinic.lat && clinic.lon)

//   // Percentage geocoded
//   const percentageGeocoded = (clinicsWithLatLon.length / clinics.length) * 100
//   console.log(percentageGeocoded, "Percentage geocoded")

//   if (clinicsWithoutLatLon.length === 0) {
//     return clinicsWithLatLon
//   }

//   // Geocode clinics without lat/lon
//   // do it in small batches with pauses to avoid rate limit
//   const batchSize = 10
//   for (let i = 0; i < clinicsWithoutLatLon.length; i += batchSize) {
//     console.log(i, "Geocoding batch")
//     const batch = clinicsWithoutLatLon.slice(i, i + batchSize)
//     const batchResults = await Promise.all(batch.map(async clinic => {
//       const coords = await getCoordinatesFromQuery(clinic.clinicAddress)
//       return {
//         ...clinic,
//         lat: coords.lat,
//         lon: coords.lon
//       }
//     }))
//     clinicsWithLatLon.push(...batchResults)

//     await new Promise(resolve => setTimeout(resolve, 2000))
//   }

//   // Persist to file
//   await fs.promises.writeFile('new_clinics.json', JSON.stringify(clinicsWithLatLon, null, 2))

//   return clinicsWithLatLon
// }

// Geocode clinics
// geocodeClinics().then(() => {
//   console.log("Geocoding completed")
// })
