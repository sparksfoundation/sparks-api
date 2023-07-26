import { FastifyInstance } from "fastify";
const schema = require('./schema.dev.json');

export const github = async (server: FastifyInstance) => {
  server.get('/credentials/github/schema', async (request, reply) => {
    reply.send({});
  });
}