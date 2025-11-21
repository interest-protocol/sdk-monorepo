import { getEnv } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  reverseBytes,
  bytesToBigInt,
} from '@interest-protocol/vortex-sdk';
import { fromHex } from '@mysten/sui/utils';
import { prove, verify } from '../pkg/nodejs/vortex';

import invariant from 'tiny-invariant';

export const deposit = async () => {
  const {
    VortexKeypair,
    keypair,
    Utxo,
    provingKey,
    verifyingKey,
    vortex,
    getMerklePath,
  } = await getEnv();
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

  const extDataHashBigInt = bytesToBigInt(reverseBytes(extDataHash));

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

  console.log('Generating proof (this may take 5-15 seconds)...');

  const proofJson = prove(JSON.stringify(input), provingKey);

  return verify(proofJson, verifyingKey);
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
