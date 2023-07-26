import { FastifyInstance } from "fastify";
export const github = async (server: FastifyInstance) => {
  server.get('/credentials/github/schema', async (request, reply) => {
    reply.send({});
  });
}