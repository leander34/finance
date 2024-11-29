import 'fastify'

import type { Member, Organization } from '@prisma/client'

import type { LoggerService } from '@/application/service/logger-service'

import { Device, Location } from './user-info'
declare module 'fastify' {
  export interface FastifyRequest {
    // requestId: string
    loggerService: LoggerService
    getUserDeviceInfo(): Promise<{
      device: Device
      location: Location | null
    }>

    getCurrentUserId(): Promise<string>
    getUserMembership(slug: string): Promise<{
      organization: Organization
      membership: Member
    }>
  }
}
