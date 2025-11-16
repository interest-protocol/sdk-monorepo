import { getEnv, Env } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  MERKLE_TREE_HEIGHT,
  ZERO_VALUE,
  Utxo,
} from '@interest-protocol/vortex-sdk';
import { fromHex, toHex } from '@mysten/sui/utils';
import { prove } from '../pkg/vortex';
import { poseidon2 } from 'poseidon-lite';
import invariant from 'tiny-invariant';
import { Transaction } from '@mysten/sui/transactions';

interface Proof {
  proofA: number[];
  proofB: number[];
  proofC: number[];
  publicInputs: [string, string, string, string, string, string, string];
  proofSerializedHex: string;
  publicInputsSerializedHex: string;
}

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

export const deposit = async ({
  VortexKeypair,
  keypair,
  vortex,
  provingKey,
}: Env) => {
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

  const proofJson = prove(JSON.stringify(input), provingKey);
  const proof: Proof = JSON.parse(proofJson);

  const publicInputs = {
    root: input.root,
    publicAmount: input.publicAmount,
    extDataHash: input.extDataHash,
    inputNullifier1: input.inputNullifier1,
    inputNullifier2: input.inputNullifier2,
    outputCommitment1: input.outputCommitment1,
    outputCommitment2: input.outputCommitment2,
    publicValue: input.publicAmount,
  };

  return {
    proof,
    extDataHash,
    encryptedUtxo,
    encryptedUtxo2,
    inputNullifier1: nullifier,
    inputNullifier2: nullifier2,
    outputCommitment1: commitment,
    outputCommitment2: commitment2,
    root: merkleTree.root(),
    extDataHashBigInt,
    publicInputs,
  };
};

(async () => {
  try {
    const env = await getEnv();
    const {
      proof,
      extDataHashBigInt,
      encryptedUtxo,
      encryptedUtxo2,
      publicInputs,
    } = await deposit(env);

    const tx = new Transaction();

    const { keypair, vortex, suiClient } = env;

    const extData = tx.moveCall({
      target: `${vortex.packageId}::vortex_ext_data::new`,
      arguments: [
        tx.pure.address(keypair.toSuiAddress()),
        tx.pure.u64(500),
        tx.pure.bool(true),
        tx.pure.address('0x0'),
        tx.pure.u64(0n),
        tx.pure.vector('u8', fromHex(encryptedUtxo)),
        tx.pure.vector('u8', fromHex(encryptedUtxo2)),
      ],
    });

    const moveProof = tx.moveCall({
      target: `${vortex.packageId}::vortex_proof::new`,
      arguments: [
        tx.pure.vector('u8', fromHex(proof.proofSerializedHex)),
        tx.pure.u256(publicInputs.root),
        tx.pure.u64(publicInputs.publicAmount),
        tx.pure.u256(extDataHashBigInt),
        tx.pure.u256(publicInputs.inputNullifier1),
        tx.pure.u256(publicInputs.inputNullifier2),
        tx.pure.u256(publicInputs.outputCommitment1),
        tx.pure.u256(publicInputs.outputCommitment2),
      ],
    });

    const suiCoin = tx.splitCoins(tx.gas, [tx.pure.u64(500n)]);

    tx.setSender(keypair.toSuiAddress());

    tx.moveCall({
      target: `${vortex.packageId}::vortex::transact`,
      arguments: [vortex.mutableVortexRef(tx), moveProof, extData, suiCoin],
    });

    const result = await keypair.signAndExecuteTransaction({
      transaction: tx,
      client: suiClient,
    });

    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
