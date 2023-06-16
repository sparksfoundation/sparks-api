const fastify = require('fastify')
const swarmRelay = require('./src/swarm-relay')
const { Spark, Random, Ed25519, Blake3, X25519SalsaPoly, Fastify } = require('sparks-sdk');
const server = fastify()

server.register(swarmRelay)

server.get('/ping', async () => {
    return 'pong\n'
})

const channels = new Spark({ 
  controller: Random, 
  signer: Ed25519, 
  hasher: Blake3, 
  cipher: X25519SalsaPoly, 
  channels: [Fastify] 
});
channels.controller.incept().then(() => {
  channels.channels.Fastify.receive(({ details, resolve, reject }: { details: any, resolve: any, reject: any }) => {
    resolve({ message: 'hello world' });
  }, { spark: channels, fastify: server })
  
  server.listen({ port: process.env.PORT || 3400 }, (err: any, address: any) => {
      if (err) {
          console.error(err)
          process.exit(1)
      }
      console.log(`Server listening at ${address}`)
  })
})

