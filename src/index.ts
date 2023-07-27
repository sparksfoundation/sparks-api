require('dotenv').config();
const fastify = require('fastify');
const server = fastify();
const { enableSwarmRelay } = require('./swarm-relay');
const { receiveChannels } = require('./channels/restAPI');
const { credentials } = require('./credentials');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const cors = require('@fastify/cors');

const start = async () => {
  server.register(fastifyCookie);

  await server.register(cors, {
    origin: process.env.IDENTITY_APP_ORIGIN,
    credentials: true
  });

  server.register(fastifySession, {
    secret: process.env.SESSION_SECRET,
    cookie: { secure: 'auto' },
    sameSite: false,
    expires: 1800000
  });

  await enableSwarmRelay(server);
  await receiveChannels(server);
  await credentials(server);

  server.get('/ping', async () => {
    return 'pong\n'
  });

  server.listen({ port: process.env.PORT || 3400 }, (err: any, address: any) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  });
}

start();
