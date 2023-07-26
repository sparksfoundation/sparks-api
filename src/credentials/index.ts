import { FastifyInstance } from "fastify";
import { email } from "./email";
import { ethereum } from "./ethereum";
import { github } from "./github";
import { medium } from "./medium";
import { twitter } from "./twitter";
import { youtube } from "./youtube";

module.exports.credentials = async (server: FastifyInstance) => {
  // return all the available credentials (with schemas) based on the folders in this directory
  server.get('/credentials', async (request, reply) => {
    
    reply.send(['ethereum']);
  });

  // register all the credentials based on the folders in this directory
  await email(server);
  await ethereum(server);
  await github(server);
  await medium(server);
  await twitter(server);
  await youtube(server);
}