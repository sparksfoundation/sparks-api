import { FastifyInstance } from "fastify";
export const twitter = async (server: FastifyInstance) => {
  server.get('/credentials/twitter/schema', async (request, reply) => {
    reply.send({});
  });
}