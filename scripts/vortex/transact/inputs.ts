// import { getEnv } from '../utils.script';
// import {
//   MerkleTree,
//   computeExtDataHash,
//   MERKLE_TREE_HEIGHT,
//   ZERO_VALUE,
//   Utxo,
//   BN254_FIELD_MODULUS,
// } from '@interest-protocol/vortex-sdk';
// import { fromHex, toHex } from '@mysten/sui/utils';
// import { prove } from '../pkg/vortex';
// import { poseidon2 } from 'poseidon-lite';
// import invariant from 'tiny-invariant';
// import { bcs } from '@mysten/sui/bcs';

// interface Proof {
//   proofA: number[];
//   proofB: number[];
//   proofC: number[];
//   publicInputs: [string, string, string, string, string, string, string];
//   proofSerializedHex: string;
//   publicInputsHex: string;
// }

// function getMerklePath(
//   merkleTree: MerkleTree,
//   utxo: Utxo | null
// ): [string, string][] {
//   if (!utxo || utxo.amount === 0n) {
//     return Array(MERKLE_TREE_HEIGHT)
//       .fill(null)
//       .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
//   }

//   // For deposits, input UTXOs don't exist in the tree yet, so return zero paths
//   const utxoIndex = Number(utxo.index);
//   const treeSize = merkleTree.layers[0]?.length ?? 0;
//   if (utxoIndex < 0 || utxoIndex >= treeSize) {
//     return Array(MERKLE_TREE_HEIGHT)
//       .fill(null)
//       .map(() => [ZERO_VALUE.toString(), ZERO_VALUE.toString()]);
//   }

//   const { pathElements, pathIndices } = merkleTree.path(utxoIndex);
//   const commitment = utxo.commitment();

//   let currentHash = commitment; // Start at leaf
//   const wasmPath: [string, string][] = [];

//   for (let i = 0; i < MERKLE_TREE_HEIGHT; i++) {
//     const sibling = pathElements[i];
//     const isLeft = pathIndices[i] === 0;

//     invariant(sibling !== undefined, 'Sibling is undefined');

//     if (isLeft) {
//       // Current is left child, sibling is right
//       wasmPath.push([currentHash.toString(), sibling.toString()]);
//       currentHash = poseidon2([currentHash, sibling]);
//     } else {
//       // Current is right child, sibling is left
//       wasmPath.push([sibling.toString(), currentHash.toString()]);
//       currentHash = poseidon2([sibling, currentHash]);
//     }
//   }

//   return wasmPath;
// }

// export const deposit = async () => {
//   const { VortexKeypair, keypair, Utxo, provingKey, verifyingKey, vortex } =
//     await getEnv();
//   const vortexKeypair = await VortexKeypair.fromSuiWallet(
//     keypair.toSuiAddress(),
//     async (message) => keypair.signPersonalMessage(message)
//   );
//   const merkleTree = new MerkleTree(26);

//   const nextIndex = await vortex.nextIndex();

//   const utxo = new Utxo({
//     amount: 500n,
//     index: BigInt(nextIndex),
//     keypair: vortexKeypair,
//   });

//   const utxo2 = new Utxo({
//     amount: 0n,
//     index: BigInt(nextIndex) + 1n,
//     keypair: vortexKeypair,
//   });

//   const commitment = utxo.commitment();
//   const commitment2 = utxo2.commitment();
//   const nullifier = utxo.nullifier();
//   const nullifier2 = utxo2.nullifier();
//   const utxoPayload = utxo.payload();
//   const utxoPayload2 = utxo2.payload();
//   const encryptedUtxo = VortexKeypair.encryptUtxoFor(
//     utxoPayload,
//     vortexKeypair.encryptionKey
//   );
//   const encryptedUtxo2 = VortexKeypair.encryptUtxoFor(
//     utxoPayload2,
//     vortexKeypair.encryptionKey
//   );

//   const extDataHash = computeExtDataHash({
//     recipient: keypair.toSuiAddress(),
//     value: utxoPayload.amount,
//     valueSign: true,
//     relayer: '0x0',
//     relayerFee: 0n,
//     encryptedOutput1: fromHex(encryptedUtxo),
//     encryptedOutput2: fromHex(encryptedUtxo2),
//   });

//   const reversedBytes = new Uint8Array(extDataHash.length);
//   for (let i = 0; i < extDataHash.length; i++) {
//     reversedBytes[i] = extDataHash[extDataHash.length - 1 - i]!;
//   }
//   const extDataHashBigInt = BigInt('0x' + toHex(reversedBytes));

//   // Prepare circuit input
//   const input = {
//     // Public inputs
//     root: merkleTree.root(), // Empty tree
//     publicAmount: utxoPayload.amount, // Depositing
//     extDataHash: extDataHashBigInt, // No external data
//     inputNullifier1: nullifier, // No inputs
//     inputNullifier2: nullifier2,
//     outputCommitment1: commitment,
//     outputCommitment2: commitment2, // Unused output
//     // Private inputs - No input UTXOs (fresh deposit)
//     inPrivateKey1: vortexKeypair.privateKey,
//     inPrivateKey2: vortexKeypair.privateKey,
//     inAmount1: utxoPayload.amount,
//     inAmount2: utxoPayload2.amount,
//     inBlinding1: utxoPayload.blinding,
//     inBlinding2: utxoPayload2.blinding,
//     inPathIndex1: utxoPayload.index,
//     inPathIndex2: utxoPayload2.index,
//     merklePath1: getMerklePath(merkleTree, utxo),
//     merklePath2: getMerklePath(merkleTree, utxo2),
//     // Private inputs - Output UTXOs
//     outPublicKey1: vortexKeypair.publicKey,
//     outPublicKey2: vortexKeypair.publicKey,
//     outAmount1: utxoPayload.amount,
//     outAmount2: utxoPayload2.amount,
//     outBlinding1: utxoPayload.blinding,
//     outBlinding2: utxoPayload2.blinding,
//   };

//   console.log('Generating proof (this may take 5-15 seconds)...');
//   const startTime = Date.now();

//   const publicInputs = {
//     root: input.root,
//     publicAmount: input.publicAmount,
//     extDataHash: input.extDataHash,
//     inputNullifier1: input.inputNullifier1,
//     inputNullifier2: input.inputNullifier2,
//     outputCommitment1: input.outputCommitment1,
//     outputCommitment2: input.outputCommitment2,
//   };

//   // Serialize public inputs as concatenated 32-byte little-endian scalar field elements
//   // BCS u256 serializes in little-endian format, so we use it directly
//   const publicInputsBytesArray = [
//     bcs
//       .u256()
//       .serialize(publicInputs.root % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(publicInputs.publicAmount % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(publicInputs.extDataHash % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(publicInputs.inputNullifier1 % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(publicInputs.inputNullifier2 % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(publicInputs.outputCommitment1 % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(publicInputs.outputCommitment2 % BN254_FIELD_MODULUS)
//       .toBytes(),
//   ];

//   const totalLength = publicInputsBytesArray.reduce(
//     (acc, curr) => acc + curr.length,
//     0
//   );

//   const publicInputsBytes = new Uint8Array(totalLength);
//   let offset = 0;
//   for (const byte of publicInputsBytesArray) {
//     publicInputsBytes.set(byte, offset);
//     offset += byte.length;
//   }

//   console.log(
//     '\nMove public inputs bytes (for public_proof_inputs_from_bytes):'
//   );
//   console.log(
//     'Length:',
//     publicInputsBytes.length,
//     'bytes (should be 224 = 7 * 32)'
//   );
//   console.log('Hex:', toHex(publicInputsBytes));
//   console.log('Array:', Array.from(publicInputsBytes));

//   const proofJson = prove(JSON.stringify(input), provingKey);
//   const proof = JSON.parse(proofJson) as Proof;

//   // Format for Sui
//   console.log('\nPublic inputs:');
//   console.log(proof.publicInputsHex);
//   const inputs = [
//     bcs
//       .u256()
//       .serialize(input.root % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u64()
//       .serialize(input.publicAmount % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(input.extDataHash % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(input.inputNullifier1 % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(input.inputNullifier2 % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(input.outputCommitment1 % BN254_FIELD_MODULUS)
//       .toBytes(),
//     bcs
//       .u256()
//       .serialize(input.outputCommitment2 % BN254_FIELD_MODULUS)
//       .toBytes(),
//   ];

//   const buffer = Buffer.concat(inputs);

//   console.log('\nInputs:');

//   const serializedInputs = bcs.vector(bcs.u8()).serialize(buffer).toHex();
//   console.log(serializedInputs);
// };

// (async () => {
//   try {
//     await deposit();
//   } catch (error) {
//     console.log(error);
//   }
// })();
