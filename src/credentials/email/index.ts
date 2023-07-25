import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";

module.exports.email = async (server: FastifyInstance) => {
  server.get('/credentials/email/schema', async (request, reply) => {
    const schema = fs.readFileSync(path.join(__dirname, './schema.json'), 'utf8');
    reply.send(schema);
  });
}