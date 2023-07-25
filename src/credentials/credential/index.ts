import Ajv from "ajv"
import MerkleTree from "merkletreejs";
import { blake3 } from "@noble/hashes/blake3";
import keccak256 from "keccak256";

// use different algos for leaves and nodes to prevent second pre-image attacks
function blakeHash(data: string) {
  return Buffer.from(blake3(data)).toString('base64')
}

function sha256Hash(data: string) {
  return keccak256('hello').toString('hex');
}

// todo - use zod 
export function buildCredential({
  schema,
  data,
}: {
  schema: Record<string, any>,
  data: Record<string, any>,
}) {

  const ajv = new Ajv(); // Create an instance of Ajv
  const validate = ajv.compile(schema.properties.credentialSubject); // Compile the schema
  const isValid = validate(data);
  if (!isValid) {
    return null;
  }

  // go through the schema properties and hash each one
  const dataset = { bob: 'you' } as any; 
  const leaves = Object.keys(dataset).map((key) => {
    const value = typeof dataset[key] === "object" ? JSON.stringify(dataset[key]) : dataset[key].toString();
    return blakeHash(value);
  });

  const merkleTree = new MerkleTree(leaves, blakeHash);
  const merkleRoot = merkleTree.getRoot().toString("hex");

  // Generate proof for a specific data element (e.g., the leaf at index 2)
  const dataIndex = 0;
  const proof = merkleTree.getProof(leaves[dataIndex]);
  console.log("Proof for Leaf at Index 0:", proof);

  // Verify the proof
  const isValidProof = MerkleTree.verify(
    proof,
    leaves[dataIndex],
    merkleTree.getRoot().toString("hex"),
  );

  console.log("Is Proof Valid?", isValidProof);

}