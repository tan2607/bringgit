export interface Clinic {
  name: string
  lat: number
  lon: number
}

export interface ClinicWithDistance extends Clinic {
  distance: number
}

export interface Coordinates {
  lat: number
  lon: number
}
