import { FastifyInstance } from "fastify";
const schema = require('./schema.dev.json');

export const twitter = async (server: FastifyInstance) => {
  server.get('/credentials/twitter/schema', async (request, reply) => {
    reply.send({});
  });
}