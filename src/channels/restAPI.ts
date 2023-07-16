import { FastifyInstance } from "fastify";

const { Spark } = require('sparks-sdk');
const { HttpRest } = require('sparks-sdk/channels/ChannelTransports/HttpRest');
const { ChannelRequestEvent } = require('sparks-sdk/channels/ChannelEvent');
const { X25519SalsaPoly } = require('sparks-sdk/ciphers/X25519SalsaPoly');
const { Basic } = require('sparks-sdk/controllers/Basic');
const { Blake3 } = require('sparks-sdk/hashers/Blake3');
const { Ed25519 } = require('sparks-sdk/signers/Ed25519');

const channels = new Spark({
  cipher: X25519SalsaPoly,
  controller: Basic,
  hasher: Blake3,
  signer: Ed25519,
});

channels.incept();

HttpRest.receive(async ({ event, confirmOpen }: any ) => {
  const channel = await confirmOpen();
  channel.on(channel.eventTypes.ANY_EVENT, async (event: any) => {
    const data = await channel.openEvent(event);
    console.log(data);
  });
}, { spark: channels });

module.exports.receiveChannels = async (server: FastifyInstance) => {
  server.post('/restAPI', async (request, reply) => {
    const payload = request.body as any;
    const origin = request.headers.origin || request.headers.host;
    const data = { ...payload.data, origin };
    const response = await HttpRest.requestHandler({ ...payload});
    reply.send(response);
  })
}