import { FastifyInstance } from "fastify";
const schema = require('./schema.dev.json');

export const youtube = async (server: FastifyInstance) => {
  server.get('/credentials/youtube/schema', async (request, reply) => {
    reply.send({});
  });
}