import { env } from '@saas/env'
import axios from 'axios'
type LocationResponse = {
  location: {
    ip: string
    location: string
  }
}

export class LocationService {
  async getUserLocation(): Promise<LocationResponse> {
    const { data } = await axios.post(
      `https://ipinfo.io/json?token${env.IPINFO_ACCESS_TOKEN}`,
    )

    return {
      location: {
        ip: '',
        location: '',
      },
    }
  }
}
