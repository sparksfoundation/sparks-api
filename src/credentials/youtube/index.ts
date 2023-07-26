import { FastifyInstance } from "fastify";
export const youtube = async (server: FastifyInstance) => {
  server.get('/credentials/youtube/schema', async (request, reply) => {
    reply.send({});
  });
}