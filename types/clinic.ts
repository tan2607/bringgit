export interface Clinic {
  area: string
  gpName: string
  clinicName: string
  clinicAddress: string
  clinicContact: string
  operatingHours: string
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

// {
//   "area": "Toa Payoh",
//   "gpName": "Dr Michael Wong Kien Yee, Dr Tan Yeow Boon",
//   "clinicName": "Union Medical Clinic & Surgery (Toa Payoh)",
//   "clinicAddress": "148 Toa Payoh Lorong 1 #01-917 Singapore 310148",
//   "clinicContact": "69633148",
//   "operatingHours": "Mon-Fri: 8:30am-2:00pm, 6:00pm-9:00pm\nSat: 8:30am-1:00pm\nPH: Closed",
//   "lat": 1.3347074,
//   "lon": 103.8438599
// }