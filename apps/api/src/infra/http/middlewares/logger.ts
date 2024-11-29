/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { v4 } from 'uuid'

import { LocationService } from '@/application/service/location-service'
import { LoggerService } from '@/application/service/logger-service'

import { getUserDeviceInfo } from './get-user-device-info'

export const loggerService = fastifyPlugin(async (app: FastifyInstance) => {
  app.register(getUserDeviceInfo).addHook('preHandler', async (request) => {
    const requestId = v4()
    const { device, location } = await request.getUserDeviceInfo()

    // pegar a rota
    // body
    // const newBody = request.body as any

    // if (newBody.password) {
    //   newBody.password = undefined
    // }
    // params/query
    // request.logger = new LoggerServiceBuilder().setRequestId(requestId).getLogger().setContext('User module').info('User created successfull', { email: 'leandersilveira@hotmail.com'})
    const requestContext = {
      params: request.params,
      query: request.query,
      hostname: request.hostname,
      url: request.url,
      method: request.method,
      protocol: request.protocol,
      headers: request.headers,
      location,
      device,
    }
    request.loggerService = new LoggerService(requestId, requestContext)
  })
})

// iPhone, BlackBerry, Pixel, HTC, Nexus, Dell, Motorola, Samsung, LG, Sony, Asus, Xiaomi, NokiaLumia, Micromax, Palm, Vertu, Pantech, Fly, Wiko, iMobile, SimValley, Wolfgang, Alcatel, Nintendo, Amoi, INQ, OnePlus, GenericPhone

// iPad, NexusTablet, GoogleTablet, SamsungTablet, Kindle, SurfaceTablet, HPTablet, AsusTablet, BlackBerryTablet, HTCtablet, MotorolaTablet, NookTablet, AcerTablet, ToshibaTablet, LGTablet, FujitsuTablet, PrestigioTablet, LenovoTablet, DellTablet, YarvikTablet, MedionTablet, ArnovaTablet, IntensoTablet, IRUTablet, MegafonTablet, EbodaTablet, AllViewTablet, ArchosTablet, AinolTablet, NokiaLumiaTablet, SonyTablet, PhilipsTablet, CubeTablet, CobyTablet, MIDTablet, MSITablet, SMiTTablet, RockChipTablet, FlyTablet, bqTablet, HuaweiTablet, NecTablet, PantechTablet, BronchoTablet, VersusTablet, ZyncTablet, PositivoTablet, NabiTablet, KoboTablet, DanewTablet, TexetTablet, PlaystationTablet, TrekstorTablet, PyleAudioTablet, AdvanTablet, DanyTechTablet, GalapadTablet, MicromaxTablet, KarbonnTablet, AllFineTablet, PROSCANTablet, YONESTablet, ChangJiaTablet, GUTablet, PointOfViewTablet, OvermaxTablet, HCLTablet, DPSTablet, VistureTablet, CrestaTablet, MediatekTablet, ConcordeTablet, GoCleverTablet, ModecomTablet, VoninoTablet, ECSTablet, StorexTablet, VodafoneTablet, EssentielBTablet, RossMoorTablet, iMobileTablet, TolinoTablet, AudioSonicTablet, AMPETablet, SkkTablet, TecnoTablet, JXDTablet, iJoyTablet, FX2Tablet, XoroTablet, ViewsonicTablet, VerizonTablet, OdysTablet, CaptivaTablet, IconbitTablet, TeclastTablet, OndaTablet, JaytechTablet, BlaupunktTablet, DigmaTablet, EvolioTablet, LavaTablet, AocTablet, MpmanTablet, CelkonTablet, WolderTablet, MediacomTablet, MiTablet, NibiruTablet, NexoTablet, LeaderTablet, UbislateTablet, PocketBookTablet, KocasoTablet, HisenseTablet, Hudl, TelstraTablet, GenericTablet
