import { FastifyInstance } from "fastify"

const DHT = require('hyperdht')
const { relay } = require('@hyperswarm/dht-relay')
const dht = new DHT()

const enableSwarmRelay = async (server: FastifyInstance) => {
    server.register(require('@fastify/websocket'))
    server.register(async function (fastify: FastifyInstance) {
        fastify.get('/swarm-relay', { websocket: true } as any, (connection: any /* SocketStream */, req /* FastifyRequest */) => {
            relay(dht, connection);
        })
    })
}

module.exports.enableSwarmRelay = enableSwarmRelay