import { FastifyInstance } from "fastify";
const { Spark } = require('sparks-sdk');
const { Random } = require('sparks-sdk/controllers');
const { Ed25519 } = require('sparks-sdk/signers');
const { Blake3 } = require('sparks-sdk/hashers');
const { X25519SalsaPoly } = require('sparks-sdk/ciphers');
const { RestAPI } = require('sparks-sdk/channels/Http');

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
    server.post('/restAPI', async (request, reply) => {
        const payload = request.body
        const response = await RestAPI.eventHandler(payload);
        reply.send(response);
    })
}


module.exports.receiveChannels = receiveChannels

