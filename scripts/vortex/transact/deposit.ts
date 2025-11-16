import { getEnv } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  MERKLE_TREE_HEIGHT,
  ZERO_VALUE,
  Utxo,
} from '@interest-protocol/vortex-sdk';
import { fromHex, toHex } from '@mysten/sui/utils';
import { prove, verify } from '../pkg/vortex';
import { poseidon2 } from 'poseidon-lite';
import invariant from 'tiny-invariant';

function getMerklePath(
  merkleTree: MerkleTree,
  utxo: Utxo | null
): [string, string][] {
  if (!utxo || utxo.amount === 0n) {
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
  }

  // For deposits, input UTXOs don't exist in the tree yet, so return zero paths
  const utxoIndex = Number(utxo.index);
  const treeSize = merkleTree.layers[0]?.length ?? 0;
  if (utxoIndex < 0 || utxoIndex >= treeSize) {
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
  }

  const { pathElements, pathIndices } = merkleTree.path(utxoIndex);
  const commitment = utxo.commitment();

  let currentHash = commitment; // Start at leaf
  const wasmPath: [string, string][] = [];

  for (let i = 0; i < MERKLE_TREE_HEIGHT; i++) {
    const sibling = pathElements[i];
    const isLeft = pathIndices[i] === 0;

    invariant(sibling !== undefined, 'Sibling is undefined');

    if (isLeft) {
      // Current is left child, sibling is right
      wasmPath.push([currentHash.toString(), sibling.toString()]);
      currentHash = poseidon2([currentHash, sibling]);
    } else {
      // Current is right child, sibling is left
      wasmPath.push([sibling.toString(), currentHash.toString()]);
      currentHash = poseidon2([sibling, currentHash]);
    }
  }

  return wasmPath;
}

export const deposit = async () => {
  const { VortexKeypair, keypair, Utxo, provingKey, verifyingKey, vortex } =
    await getEnv();
  const vortexKeypair = await VortexKeypair.fromSuiWallet(
    keypair.toSuiAddress(),
    async (message) => keypair.signPersonalMessage(message)
  );
  const merkleTree = new MerkleTree(26);

  const nextIndex = await vortex.nextIndex();

  const utxo = new Utxo({
    amount: 500n,
    index: BigInt(nextIndex),
    keypair: vortexKeypair,
  });

  const utxo2 = new Utxo({
    amount: 0n,
    index: BigInt(nextIndex) + 1n,
    keypair: vortexKeypair,
  });

  const commitment = utxo.commitment();
  const commitment2 = utxo2.commitment();
  const nullifier = utxo.nullifier();
  const nullifier2 = utxo2.nullifier();
  const utxoPayload = utxo.payload();
  const utxoPayload2 = utxo2.payload();
  const encryptedUtxo = VortexKeypair.encryptUtxoFor(
    utxoPayload,
    vortexKeypair.encryptionKey
  );
  const encryptedUtxo2 = VortexKeypair.encryptUtxoFor(
    utxoPayload2,
    vortexKeypair.encryptionKey
  );

  const extDataHash = computeExtDataHash({
    recipient: keypair.toSuiAddress(),
    value: utxoPayload.amount,
    valueSign: true,
    relayer: '0x0',
    relayerFee: 0n,
    encryptedOutput1: fromHex(encryptedUtxo),
    encryptedOutput2: fromHex(encryptedUtxo2),
  });

  const reversedBytes = new Uint8Array(extDataHash.length);
  for (let i = 0; i < extDataHash.length; i++) {
    reversedBytes[i] = extDataHash[extDataHash.length - 1 - i]!;
  }
  const extDataHashBigInt = BigInt('0x' + toHex(reversedBytes));

  // Prepare circuit input
  const input = {
    // Public inputs
    root: merkleTree.root(), // Empty tree
    publicAmount: utxoPayload.amount, // Depositing
    extDataHash: extDataHashBigInt, // No external data
    inputNullifier1: nullifier, // No inputs
    inputNullifier2: nullifier2,
    outputCommitment1: commitment,
    outputCommitment2: commitment2, // Unused output
    // Private inputs - No input UTXOs (fresh deposit)
    inPrivateKey1: vortexKeypair.privateKey,
    inPrivateKey2: vortexKeypair.privateKey,
    inAmount1: utxoPayload.amount,
    inAmount2: utxoPayload2.amount,
    inBlinding1: utxoPayload.blinding,
    inBlinding2: utxoPayload2.blinding,
    inPathIndex1: utxoPayload.index,
    inPathIndex2: utxoPayload2.index,
    merklePath1: getMerklePath(merkleTree, utxo),
    merklePath2: getMerklePath(merkleTree, utxo2),
    // Private inputs - Output UTXOs
    outPublicKey1: vortexKeypair.publicKey,
    outPublicKey2: vortexKeypair.publicKey,
    outAmount1: utxoPayload.amount,
    outAmount2: utxoPayload2.amount,
    outBlinding1: utxoPayload.blinding,
    outBlinding2: utxoPayload2.blinding,
  };

  console.log('Generating proof (this may take 5-15 seconds)...');
  const startTime = Date.now();

  console.log(input);

  const proofJson = prove(JSON.stringify(input), provingKey);
  const proof = JSON.parse(proofJson);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`✓ Proof generated in ${duration}s\n`);
  console.log(proof);

  // Format for Sui
  console.log('Sui Move format:');
  console.log(
    JSON.stringify(
      {
        a: proof.proofA,
        b: proof.proofB,
        c: proof.proofC,
        root: proof.publicInputs[0],
        inputNullifier1: proof.publicInputs[3],
        inputNullifier2: proof.publicInputs[4],
        outputCommitment1: proof.publicInputs[5],
        outputCommitment2: proof.publicInputs[6],
        publicValue: proof.publicInputs[1],
        extDataHash: proof.publicInputs[2],
      },
      null,
      2
    )
  );

  // Verify proof
  console.log('Verifying proof...');
  const isValid = verify(proofJson, verifyingKey);
  invariant(isValid, 'Proof is invalid');

  return proof;
};

(async () => {
  try {
    const proof = await deposit();
    console.log(proof);
    console.log('SUCCESS!! PROOF VERIFIED');
  } catch (error) {
    console.log(error);
  }
})();
