const fastify = require('fastify')
const server = fastify()
const { enableSwarmRelay } = require('./src/swarm-relay')
const { receiveChannels } = require('./src/channels/restAPI')

const start = async () => {
    await enableSwarmRelay(server)
    await receiveChannels(server)

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
