import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import rawbody, { RawBodyPluginOptions } from 'fastify-raw-body'

export const rawBodyPlugin = fastifyPlugin<RawBodyPluginOptions>(
  async (app: FastifyInstance) => {
    app.register(rawbody, {
      field: 'rawBody', // change the default request.rawBody property name
      global: false, // add the rawBody to every request. **Default true**
      encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
      runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
      routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
    })
  },
)
