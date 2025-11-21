import { getEnv } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  MERKLE_TREE_HEIGHT,
  ZERO_VALUE,
  Utxo,
  poseidon2,
} from '@interest-protocol/vortex-sdk';
import { fromHex, toHex } from '@mysten/sui/utils';
import { prove, verify } from '../pkg/nodejs/vortex';

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
      currentHash = poseidon2(currentHash, sibling);
    } else {
      // Current is right child, sibling is left
      wasmPath.push([sibling.toString(), currentHash.toString()]);
      currentHash = poseidon2(sibling, currentHash);
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

  const inputUtxo0 = new Utxo({
    amount: 0n,
    index: BigInt(nextIndex),
    keypair: vortexKeypair,
  });

  const inputUtxo1 = new Utxo({
    amount: 0n,
    index: BigInt(nextIndex) + 1n,
    keypair: vortexKeypair,
  });

  // Output UTXOs: the actual deposit. Commitment Utxos do not need an index.
  const outputUtxo0 = new Utxo({
    amount: 500n,
    index: 0n,
    keypair: vortexKeypair,
  });

  const outputUtxo1 = new Utxo({
    amount: 0n,
    index: 0n,
    keypair: vortexKeypair,
  });

  const commitment0 = outputUtxo0.commitment();
  const commitment1 = outputUtxo1.commitment();

  const nullifier0 = inputUtxo0.nullifier();
  const nullifier1 = inputUtxo1.nullifier();

  const encryptedUtxo0 = VortexKeypair.encryptUtxoFor(
    outputUtxo0.payload(),
    vortexKeypair.encryptionKey
  );
  const encryptedUtxo1 = VortexKeypair.encryptUtxoFor(
    outputUtxo1.payload(),
    vortexKeypair.encryptionKey
  );

  // Deposit
  const publicAmount = 500n;

  const extDataHash = computeExtDataHash({
    recipient: keypair.toSuiAddress(),
    value: publicAmount,
    valueSign: true,
    relayer: '0x0',
    relayerFee: 0n,
    encryptedOutput0: fromHex(encryptedUtxo0),
    encryptedOutput1: fromHex(encryptedUtxo1),
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
    publicAmount, // Depositing
    extDataHash: extDataHashBigInt, // No external data
    inputNullifier0: nullifier0, // No inputs
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1, // Unused output
    // Private inputs - No input UTXOs (fresh deposit)
    inPrivateKey0: vortexKeypair.privateKey,
    inPrivateKey1: vortexKeypair.privateKey,
    inAmount0: inputUtxo0.amount,
    inAmount1: inputUtxo1.amount,
    inBlinding0: inputUtxo0.blinding,
    inBlinding1: inputUtxo1.blinding,
    inPathIndex0: inputUtxo0.index,
    inPathIndex1: inputUtxo1.index,
    merklePath0: getMerklePath(merkleTree, outputUtxo0),
    merklePath1: getMerklePath(merkleTree, outputUtxo1),
    // Private inputs - Output UTXOs
    outPublicKey0: vortexKeypair.publicKey,
    outPublicKey1: vortexKeypair.publicKey,
    outAmount0: outputUtxo0.amount,
    outAmount1: outputUtxo1.amount,
    outBlinding0: outputUtxo0.blinding,
    outBlinding1: outputUtxo1.blinding,
  };

  console.log(input);

  console.log('Generating proof (this may take 5-15 seconds)...');

  const proofJson = prove(JSON.stringify(input), provingKey);

  const isValid = verify(proofJson, verifyingKey);
  return isValid;
};

(async () => {
  try {
    const isValid = await deposit();

    console.log('isValid', typeof isValid, isValid);

    invariant(isValid, 'Proof verification failed');

    console.log('SUCCESS!! PROOF VERIFIED');
  } catch (error) {
    console.log(error);
  }
})();
