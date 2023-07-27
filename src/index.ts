require('dotenv').config();
const fastify = require('fastify');
const server = fastify();
const { enableSwarmRelay } = require('./swarm-relay');
const { receiveChannels } = require('./channels/restAPI');
const { credentials } = require('./credentials');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/secure-session');
const cors = require('@fastify/cors');

const start = async () => {
  await server.register(cors, {
    origin: process.env.IDENTITY_APP_ORIGIN,
    credentials: true
  });

  server.register(fastifyCookie);

  server.register(fastifySession, {
    key: Buffer.from(process.env.SESSION_SECRET_KEY as string, 'hex'),
    cookie: {
      path: '/',
      httpOnly: process.env.IDENTITY_APP_ORIGIN?.startsWith('https'),
      sameSite: 'none',
      domain: process.env.IDENTITY_APP_ORIGIN,
    }
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
