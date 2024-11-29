import { env } from '@saas/env'
import axios from 'axios'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import MobileDetect from 'mobile-detect'

import type { Location } from '@/@types/user-info'
import { splitLoc } from '@/utils/split-loc'

export const getUserDeviceInfo = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getUserDeviceInfo = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let location: Location | null = null
      try {
        const { data } = await axios.post(
          `https://ipinfo.io/json?token${env.IPINFO_ACCESS_TOKEN}`,
        )
        if (data) {
          const { loc } = data
          const { latitude, longitude } = splitLoc(loc)

          location = {
            ip: data.ip,
            hostname: data.hostname,
            city: data.city,
            region: data.region,
            country: data.country,
            latitude,
            longitude,
            org: data.org,
            postal: data.postal,
            timezone: data.timezone,
          }
        }
      } catch (error) {}

      //   const ip = request.headers['x-forwarded-for'] || request.ip
      const deviceLanguage =
        request.headers['accept-language']?.split(',')[0] ?? null
      const userAgency = request.headers['user-agent'] || ''
      const md = new MobileDetect(userAgency)
      const device = {
        ip: String(request.ip),
        rawUserAgency: userAgency,
        language: deviceLanguage,
        mobile: md.mobile(),
        phone: md.phone(),
        tablet: md.tablet(),
        os: md.os(),
        userAgency: md.userAgent(),
      }
      return {
        device,
        location,
      }
    }
  })
})

// iPhone, BlackBerry, Pixel, HTC, Nexus, Dell, Motorola, Samsung, LG, Sony, Asus, Xiaomi, NokiaLumia, Micromax, Palm, Vertu, Pantech, Fly, Wiko, iMobile, SimValley, Wolfgang, Alcatel, Nintendo, Amoi, INQ, OnePlus, GenericPhone

// iPad, NexusTablet, GoogleTablet, SamsungTablet, Kindle, SurfaceTablet, HPTablet, AsusTablet, BlackBerryTablet, HTCtablet, MotorolaTablet, NookTablet, AcerTablet, ToshibaTablet, LGTablet, FujitsuTablet, PrestigioTablet, LenovoTablet, DellTablet, YarvikTablet, MedionTablet, ArnovaTablet, IntensoTablet, IRUTablet, MegafonTablet, EbodaTablet, AllViewTablet, ArchosTablet, AinolTablet, NokiaLumiaTablet, SonyTablet, PhilipsTablet, CubeTablet, CobyTablet, MIDTablet, MSITablet, SMiTTablet, RockChipTablet, FlyTablet, bqTablet, HuaweiTablet, NecTablet, PantechTablet, BronchoTablet, VersusTablet, ZyncTablet, PositivoTablet, NabiTablet, KoboTablet, DanewTablet, TexetTablet, PlaystationTablet, TrekstorTablet, PyleAudioTablet, AdvanTablet, DanyTechTablet, GalapadTablet, MicromaxTablet, KarbonnTablet, AllFineTablet, PROSCANTablet, YONESTablet, ChangJiaTablet, GUTablet, PointOfViewTablet, OvermaxTablet, HCLTablet, DPSTablet, VistureTablet, CrestaTablet, MediatekTablet, ConcordeTablet, GoCleverTablet, ModecomTablet, VoninoTablet, ECSTablet, StorexTablet, VodafoneTablet, EssentielBTablet, RossMoorTablet, iMobileTablet, TolinoTablet, AudioSonicTablet, AMPETablet, SkkTablet, TecnoTablet, JXDTablet, iJoyTablet, FX2Tablet, XoroTablet, ViewsonicTablet, VerizonTablet, OdysTablet, CaptivaTablet, IconbitTablet, TeclastTablet, OndaTablet, JaytechTablet, BlaupunktTablet, DigmaTablet, EvolioTablet, LavaTablet, AocTablet, MpmanTablet, CelkonTablet, WolderTablet, MediacomTablet, MiTablet, NibiruTablet, NexoTablet, LeaderTablet, UbislateTablet, PocketBookTablet, KocasoTablet, HisenseTablet, Hudl, TelstraTablet, GenericTablet
