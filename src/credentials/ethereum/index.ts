import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { createId } from '@paralleldrive/cuid2';
import { ethers } from "ethers";
import { buildCredential } from "../credential";

module.exports.ethereum = async (server: FastifyInstance) => {
  server.get('/credentials/ethereum/schema', async (request: any, reply) => {    
    const schema = fs.readFileSync(path.join(__dirname, './schema.json'), 'utf8');
    reply.send(schema);
  });

  // accept users' public key and issue a challenge code for the user to sign
  server.get('/credentials/ethereum/challenge', async (request: any, reply) => {
    const { publicKey } = request.body as any;
    if (!publicKey) {
      reply.status(400).send({ error: "Missing public key" });
      return;
    }
      
      const challengeCode = createId();
      request.session.ethereum = {
        challengeCode,
        publicKey,
      }

      reply.send({ challengeCode });
    }
  );

  // check the signed challenge code and issue a credential if it's valid
  server.get('/credentials/ethereum/verify', async (request: any, reply) => {
    const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './schema.json'), 'utf8'));
    
    const credential = buildCredential({
      schema,
      data: { 
        address: '0x1CeDC0f3Af8f9841B0a1F5c1a4DDc6e1a1629074',
      }
    });

    return reply.send({ credential });



    // const { signature } = request.body as any;
    // const { challengeCode, publicKey } = request.session.ethereum;

    // if (!signature) {
    //   reply.status(400).send({ error: "Missing signature" });
    //   return;
    // }

    // if (!challengeCode || !publicKey) {
    //   reply.status(400).send({ error: "Missing challenge" });
    //   return;
    // }

    // const signerAddr = await ethers.verifyMessage(challengeCode, signature);
    // if (signerAddr !== publicKey) {
    //   reply.status(400).send({ error: "Invalid signature" });
    //   return;
    // }

    // // get the schema as a json object
    // const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './schema.json'), 'utf8'));

    // // create the credential
    // const credential = buildCredential({
    //   schema,
    //   data: { address: signerAddr }
    // });

    // console.log(credential)

    // // TODO: issue credential
    // reply.send({ success: true });
  });
}