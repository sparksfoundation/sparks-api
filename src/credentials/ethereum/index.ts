import { FastifyInstance } from "fastify";
import { createId } from '@paralleldrive/cuid2';
import { ethers } from "ethers";
import { Spark } from "sparks-sdk";
import { X25519SalsaPoly } from "sparks-sdk/ciphers/X25519SalsaPoly";
import { Basic } from "sparks-sdk/controllers/Basic";
import { Ed25519 } from "sparks-sdk/signers/Ed25519";
import { Blake3 } from "sparks-sdk/hashers/Blake3";
import { Attester } from "sparks-sdk/agents/Attester";
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const Moralis = require('moralis').default;
const schema = require('./schema.json');

const attester = new Spark<[Attester], X25519SalsaPoly, Basic, Blake3, Ed25519>({
  agents: [Attester],
  cipher: X25519SalsaPoly,
  controller: Basic,
  hasher: Blake3,
  signer: Ed25519,
});
attester.incept();

async function getHoldings(publicKey: string) {
  const tokensBalance = await Moralis.EvmApi.token.getWalletTokenBalances({
    "chain": EvmChain.ETHEREUM,
    "address": publicKey,
  });

  const nftsBalance = await Moralis.EvmApi.nft.getWalletNFTs({
    "chain": EvmChain.ETHEREUM,
    "format": "decimal",
    "mediaItems": false,
    "address": publicKey
  });

  // return just the contract address and symbol
  const holdings = [
    ...nftsBalance.toJSON().result.map((nft: any) => {
      return {
        address: nft.token_address,
        symbol: nft.symbol,
        balance: nft.amount,
      }
    }),
    ...tokensBalance.toJSON().map((token: any) => {
      return {
        address: token.token_address,
        symbol: token.symbol,
        balance: token.balance,
      }
    })
  ];

  return holdings.filter((holding: any) => Number.parseInt(holding.balance) > 0);
}

export const ethereum = async (server: FastifyInstance) => {
  Moralis.start({ apiKey: process.env.MORALIS_API });

  // get the credential schema
  server.get('/credentials/ethereum/schema', async (request: any, reply) => {
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
    request.session.set('ethereum', { code, publicKey, identifier })
    reply.send(code);
  });

  // get available tokens and nfts for the user to select
  server.get('/credentials/ethereum/holdings', async (request: any, reply) => {
    const { code, publicKey, identifier } = request.session.get('ethereum');
    if (!code || !publicKey || !identifier) {
      reply.status(400).send({ error: "Missing challenge, public key, or identifier" });
      return;
    }

    // get balances
    try {
      const holdings = await getHoldings(publicKey);
      reply.send(holdings);
    } catch (error) {
      console.log(error);
      reply.status(400).send({ error: "Failed to fetch holdings" });
      return;
    }
  });

  // check the signed challenge code and issue a credential if it's valid
  server.post('/credentials/ethereum/claim', async (request: any, reply) => {
    const { code, publicKey, identifier } = request.session.get('ethereum');
    const { signature, holdings } = request.body as any;
    if (!signature || !code || !publicKey || !identifier) {
      reply.status(400).send({ error: "Missing signature, challenge, public key, or identifier" });
      return;
    }

    // check the signature
    const signerAddr = ethers.verifyMessage(code, signature);
    if (signerAddr !== publicKey) {
      reply.status(400).send({ error: "Invalid signature" });
      return;
    }

    // get balances
    try {
      const ethBalance = await Moralis.EvmApi.balance.getNativeBalance({
        "chain": EvmChain.ETHEREUM,
        "address": publicKey
      });

      let userHoldings = holdings.length > 0 ?
        (await getHoldings(publicKey)).filter(c => holdings.includes(c.symbol)): []

      // TODO - lookup user's token balances befure building the credential
      const credential = await attester.agents.attester.buildCredential({
        schema,
        data: {
          id: attester.identifier,
          address: publicKey,
          balance: ethBalance.toJSON().balance,
          holdings: [
            ...userHoldings
          ]
        }
      });

      // destroy the session
      request.session.ethereum = null;
      return reply.send(JSON.stringify(credential, null, 2));

    } catch (error) {
      console.log(error);
      reply.status(400).send({ error: "Failed to fetch balances" });
      return;
    }
  });
}