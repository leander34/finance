// import { fileURLToPath } from 'node:url'

// import createJiti from 'jiti'
// const jiti = createJiti(fileURLToPath(import.meta.url))
// console.log(import.meta.url)
// jiti('./app/env')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'main-banks.s3.amazonaws.com' }],
  },
}

export default nextConfig
