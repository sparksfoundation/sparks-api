const fastify = require('fastify')
const swarmRelay = require('./src/swarm-relay')
const { initRestChannel } = require('./src/channels')
const server = fastify()

server.register(swarmRelay)

server.get('/ping', async () => {
    return 'pong\n'
})

initRestChannel(server).then(() => {
  server.listen({ port: process.env.PORT || 3400 }, (err: any, address: any) => {
      if (err) {
          console.error(err)
          process.exit(1)
      }
      console.log(`Server listening at ${address}`)
  })
});

