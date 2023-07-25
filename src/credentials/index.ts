import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";

module.exports.credentials = async (server: FastifyInstance) => {
  // return all the available credentials based on the folders in this directory
  server.get('/credentials', async (request, reply) => {
    const credentialsDir = __dirname;
    const credentialFolders = await fs.promises.readdir(credentialsDir);
    const credentialNames = credentialFolders.map((file) => path.parse(file).name);
    reply.send(credentialNames);
  });
}