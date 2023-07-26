import { FastifyInstance } from "fastify";
export const medium = async (server: FastifyInstance) => {
  server.get('/credentials/medium/schema', async (request, reply) => {
    reply.send({});
  });
}