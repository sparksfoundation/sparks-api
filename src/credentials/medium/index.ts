import { FastifyInstance } from "fastify";
const schema = require('./schema.dev.json');

export const medium = async (server: FastifyInstance) => {
  server.get('/credentials/medium/schema', async (request, reply) => {
    reply.send({});
  });
}