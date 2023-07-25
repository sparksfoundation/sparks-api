import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { email } from "./email";
import { ethereum } from "./ethereum";
import { github } from "./github";
import { medium } from "./medium";
import { twitter } from "./twitter";
import { youtube } from "./youtube";

module.exports.credentials = async (server: FastifyInstance) => {
  // return all the available credentials (with schemas) based on the folders in this directory
  server.get('/credentials', async (request, reply) => {
    const credentialsDir = __dirname;
    const credentialFolders = await fs.promises.readdir(credentialsDir);
    const credentialNames = credentialFolders
    .filter((file) => fs.lstatSync(path.join(credentialsDir, file)).isDirectory())
    .filter((file) => fs.existsSync(path.join(credentialsDir, file, 'schema.json')))
    .map((file) => path.parse(file).name);

    reply.send(credentialNames);
  });

  // register all the credentials based on the folders in this directory
  await email(server);
  await ethereum(server);
  await github(server);
  await medium(server);
  await twitter(server);
  await youtube(server);
}