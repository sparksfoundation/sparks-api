import { FastifyInstance } from "fastify";

const { Spark } = require('sparks-sdk');
const { RestAPI } = require('sparks-sdk/channels/Http');
const { X25519SalsaPoly } = require('sparks-sdk/cipher/X25519SalsaPoly');
const { Basic } = require('sparks-sdk/controllers/Basic');
const { Blake3 } = require('sparks-sdk/hashers/Blake3');
const { Ed25519 } = require('sparks-sdk/signers/Ed25519');

const channels = new Spark({
  cipher: X25519SalsaPoly,
  controller: Basic,
  hasher: Blake3,
  signer: Ed25519,
});
channels.generateKeyPairs()
  .then((keyPairs: any) => {
    channels.setKeyPairs({ keyPairs })
    channels.incept()
  })

RestAPI.handleOpenRequests(
  async ({ details, resolve, reject }: { details: any, resolve: any, reject: any }) => {
    const channel = await resolve();
    channel.onmessage = ({ data }: any) => console.log(channel.peer.identifier.slice(0, 4) + ': ' + data)
  }, { spark: channels }
);

module.exports.receiveChannels = async (server: FastifyInstance) => {
  server.post('/restAPI', async (request, reply) => {
    const payload = request.body as any;
    const response = await RestAPI.requestHandler(payload);
    reply.send(response || {});
  })
}