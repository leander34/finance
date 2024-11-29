export type Device = {
  ip: string
  rawUserAgency: string
  language: string | null
  mobile: string | null
  phone: string | null
  tablet: string | null
  os: string
  userAgency: string
}

export type Location = {
  ip: string
  hostname: string
  city: string
  region: string
  country: string
  latitude: number
  longitude: number
  org: string
  postal: string
  timezone: string
}
