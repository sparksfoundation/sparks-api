import { FastifyInstance } from "fastify";
const { Spark, Random, Ed25519, Blake3, X25519SalsaPoly, RestAPI } = require('sparks-sdk');
const simpleSignalServer = require('simple-signal-server');

const channels = new Spark({
    controller: Random,
    signer: Ed25519,
    hasher: Blake3,
    cipher: X25519SalsaPoly,
});

channels.controller.incept();
RestAPI.receive(
    ({ details, resolve, reject }: { details: any, resolve: any, reject: any }) => {
        resolve();
    }, { spark: channels }
);

const receiveChannels = async (server: FastifyInstance) => {
    server.post('/channels', async (request, reply) => {
        const payload = request.body
        const response = await RestAPI.eventHandler(payload);
        reply.send(response);
    })
}

module.exports.receiveChannels = receiveChannels

