import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { createId } from '@paralleldrive/cuid2';
import { ethers } from "ethers";
import { Spark } from "sparks-sdk";
import { X25519SalsaPoly } from "sparks-sdk/ciphers/X25519SalsaPoly";
import { Basic } from "sparks-sdk/controllers/Basic";
import { Ed25519 } from "sparks-sdk/signers/Ed25519";
import { Blake3 } from "sparks-sdk/hashers/Blake3";
import { Attester } from "sparks-sdk/agents/Attester";

const attester = new Spark<
  [Attester],
  X25519SalsaPoly,
  Basic,
  Blake3,
  Ed25519
>({
  agents: [Attester],
  cipher: X25519SalsaPoly,
  controller: Basic,
  hasher: Blake3,
  signer: Ed25519,
});

attester.incept()

export const ethereum = async (server: FastifyInstance) => {
  server.get('/credentials/ethereum/schema', async (request: any, reply) => {
    const schema = fs.readFileSync(path.join(__dirname, './schema.json'), 'utf8');
    reply.send(schema);
  });

  // accept users' public key and issue a challenge code for the user to sign
  server.post('/credentials/ethereum/challenge', async (request: any, reply) => {
    const { identifier, publicKey } = request.body as any;
    if (!identifier || !publicKey) {
      reply.status(400).send({ error: "Missing identifier or ethereum public key" });
      return;
    }

    const code = createId();

    request.session.ethereum = {
      code,
      publicKey,
      identifier,
    }

    reply.send(code);
  });

  // check the signed challenge code and issue a credential if it's valid
  server.post('/credentials/ethereum/claim', async (request: any, reply) => {
    const schema = JSON.parse(fs.readFileSync(path.join(__dirname, './schema.json'), 'utf8'));
    const { code, publicKey, identifier } = request.session.ethereum;

    const { signature } = request.body as any;

    if (!signature || !code || !publicKey || !identifier) {
      reply.status(400).send({ error: "Missing signature, challenge, public key, or identifier" });
      return;
    }

    // check the signature
    const signerAddr = await ethers.verifyMessage(code, signature);
    if (signerAddr !== publicKey) {
      reply.status(400).send({ error: "Invalid signature" });
      return;
    }

    // TODO - lookup user's token balances befure building the credential
    const credential = await attester.agents.attester.buildCredential({
      schema,
      data: {
        id: attester.identifier,
        address: publicKey,
        holdings: []
      }
    });

    // destroy the session
    request.session.ethereum = null;
    return reply.send(JSON.stringify(credential, null, 2));
  });
}