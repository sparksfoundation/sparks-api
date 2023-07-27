import { FastifyInstance } from "fastify";
export const email = async (server: FastifyInstance) => {
  server.get('/credentials/email/schema', async (request: any, reply) => {
    reply.send({});
  });
}