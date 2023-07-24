import { FastifyInstance } from "fastify";
import { Spark } from "sparks-sdk";
import { HttpRest } from "sparks-sdk/channels/HttpRest";
import { X25519SalsaPoly } from "sparks-sdk/ciphers/X25519SalsaPoly";
import { Basic } from "sparks-sdk/controllers/Basic";
import { Blake3 } from "sparks-sdk/hashers/Blake3";
import { Ed25519 } from "sparks-sdk/signers/Ed25519";

const channels = new Spark({
  cipher: X25519SalsaPoly,
  controller: Basic,
  hasher: Blake3,
  signer: Ed25519,
});

channels.incept();

HttpRest.receive(async ({ event, confirmOpen }: any ) => {
  const channel = await confirmOpen();
  channel.on(channel.eventTypes.MESSAGE_REQUEST, async (event: any) => {
    const data = await channel.getEventData(event);
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