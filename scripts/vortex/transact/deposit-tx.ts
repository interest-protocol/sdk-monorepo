import { getEnv, Env } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  MERKLE_TREE_HEIGHT,
  ZERO_VALUE,
  BN254_FIELD_MODULUS,
  Utxo,
} from '@interest-protocol/vortex-sdk';
import { fromHex, toHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { prove } from '../pkg/nodejs/vortex';
import { poseidon2 } from 'poseidon-lite';
import invariant from 'tiny-invariant';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

interface Proof {
  proofA: number[];
  proofB: number[];
  proofC: number[];
  publicInputs: [string, string, string, string, string, string, string];
  proofSerializedHex: string;
  publicInputsHex: string;
}

function getMerklePath(
  merkleTree: MerkleTree,
  utxo: Utxo | null
): [bigint, bigint][] {
  if (!utxo || utxo.amount === 0n) {
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE, ZERO_VALUE]);
  }

  // For deposits, input UTXOs don't exist in the tree yet, so return zero paths
  const utxoIndex = Number(utxo.index);
  const treeSize = merkleTree.layers[0]?.length ?? 0;
  if (utxoIndex < 0 || utxoIndex >= treeSize) {
    return Array(MERKLE_TREE_HEIGHT)
      .fill(null)
      .map(() => [ZERO_VALUE, ZERO_VALUE]);
  }

  const { pathElements, pathIndices } = merkleTree.path(utxoIndex);
  const commitment = utxo.commitment();

  let currentHash = commitment; // Start at leaf
  const wasmPath: [bigint, bigint][] = [];

  for (let i = 0; i < MERKLE_TREE_HEIGHT; i++) {
    const sibling = pathElements[i];
    const isLeft = pathIndices[i] === 0;

    invariant(sibling !== undefined, 'Sibling is undefined');

    if (isLeft) {
      // Current is left child, sibling is right
      wasmPath.push([currentHash, sibling]);
      currentHash = poseidon2([currentHash, sibling]);
    } else {
      // Current is right child, sibling is left
      wasmPath.push([sibling, currentHash]);
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

  const proofJson = prove(JSON.stringify(input), provingKey);
  const proof: Proof = JSON.parse(proofJson);

  const publicInputs = {
    root: input.root,
    publicAmount: input.publicAmount,
    extDataHash: input.extDataHash,
    inputNullifier0: input.inputNullifier0,
    inputNullifier1: input.inputNullifier1,
    outputCommitment0: input.outputCommitment0,
    outputCommitment1: input.outputCommitment1,
  };

  const publicInputsBytesArray = [
    bcs
      .u256()
      .serialize(publicInputs.root % BN254_FIELD_MODULUS)
      .toBytes(),
    bcs
      .u256()
      .serialize(publicInputs.publicAmount % BN254_FIELD_MODULUS)
      .toBytes(),
    bcs
      .u256()
      .serialize(publicInputs.extDataHash % BN254_FIELD_MODULUS)
      .toBytes(),
    bcs
      .u256()
      .serialize(publicInputs.inputNullifier1 % BN254_FIELD_MODULUS)
      .toBytes(),
    bcs
      .u256()
      .serialize(publicInputs.inputNullifier1 % BN254_FIELD_MODULUS)
      .toBytes(),
    bcs
      .u256()
      .serialize(publicInputs.outputCommitment1 % BN254_FIELD_MODULUS)
      .toBytes(),
    bcs
      .u256()
      .serialize(publicInputs.outputCommitment1 % BN254_FIELD_MODULUS)
      .toBytes(),
  ];

  const totalLength = publicInputsBytesArray.reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  const publicInputsBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const byte of publicInputsBytesArray) {
    publicInputsBytes.set(byte, offset);
    offset += byte.length;
  }

  return {
    proof,
    extDataHash,
    encryptedUtxo0,
    encryptedUtxo1,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
    root: merkleTree.root(),
    extDataHashBigInt,
    publicInputs,
    publicInputsBytes,
  };
};

(async () => {
  try {
    const env = await getEnv();
    const {
      proof,
      publicInputsBytes,
      encryptedUtxo0,
      encryptedUtxo1,
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
        tx.pure.address(normalizeSuiAddress('0x0')),
        tx.pure.u64(0n),
        tx.pure.vector('u8', fromHex(encryptedUtxo0)),
        tx.pure.vector('u8', fromHex(encryptedUtxo1)),
      ],
    });

    const moveProof = tx.moveCall({
      target: `${vortex.packageId}::vortex_proof::new`,
      arguments: [
        tx.pure.vector('u8', fromHex('0x' + proof.proofSerializedHex)),
        tx.pure.u256(publicInputs.root),
        tx.pure.u256(publicInputs.publicAmount),
        tx.pure.u256(publicInputs.extDataHash),
        tx.pure.u256(publicInputs.inputNullifier0),
        tx.pure.u256(publicInputs.inputNullifier1),
        tx.pure.u256(publicInputs.outputCommitment0),
        tx.pure.u256(publicInputs.outputCommitment1),
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
