const fastify = require('fastify')
const swarmRelay = require('./src/swarm-relay')
const { receiveChannels } = require('./src/channels')
const server = fastify()

server.register(swarmRelay)

server.get('/ping', async () => {
    return 'pong\n'
})

receiveChannels(server).then(() => {
  server.listen({ port: process.env.PORT || 3400 }, (err: any, address: any) => {
      if (err) {
          console.error(err)
          process.exit(1)
      }
      console.log(`Server listening at ${address}`)
  })
});

