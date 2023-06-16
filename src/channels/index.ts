import { FastifyInstance } from "fastify";

const { Spark, Random, Ed25519, Blake3, X25519SalsaPoly, Fastify: FastifyChannel } = require('sparks-sdk');

const channels = new Spark({
    controller: Random,
    signer: Ed25519,
    hasher: Blake3,
    cipher: X25519SalsaPoly,
    channels: [ FastifyChannel ]
});

module.exports.initRestChannel = async (server: FastifyInstance) => {
    await channels.controller.incept()
    channels.channels.Fastify.receive(({ details, resolve, reject }: { details: any, resolve: any, reject: any }) => {
        resolve();
    }, { spark: channels, fastify: server })
}
