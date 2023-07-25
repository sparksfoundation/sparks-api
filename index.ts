const fastify = require('fastify')
const server = fastify()
const { enableSwarmRelay } = require('./src/swarm-relay')
const { receiveChannels } = require('./src/channels/restAPI')
const { credentials } = require('./src/credentials')
const { ethereum } = require('./src/credentials/ethereum')
const fastifyCookie = require('@fastify/cookie')
const fastifySession = require('@fastify/session')

const start = async () => {
  server.register(fastifyCookie);
  server.register(fastifySession, {
    cookieName: 'sessionId',
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: false },
    expires: 1800000
  });

  await enableSwarmRelay(server)
  await receiveChannels(server)
  await credentials(server)
  await ethereum(server)

  server.get('/ping', async () => {
    return 'pong\n'
  })

  server.listen({ port: process.env.PORT || 3400 }, (err: any, address: any) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

start();
