import { FastifyInstance } from "fastify";
const schema = require('./schema.dev.json');

export const email = async (server: FastifyInstance) => {
  server.get('/credentials/email/schema', async (request: any, reply) => {
    reply.send({});
  });
}