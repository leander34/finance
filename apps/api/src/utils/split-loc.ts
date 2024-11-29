export function splitLoc(loc: string) {
  const [latitude, longitude] = loc.split(',')
  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  }
}
