import { getEnv } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  reverseBytes,
  bytesToBigInt,
  toProveInput,
} from '@interest-protocol/vortex-sdk';
import { fromHex } from '@mysten/sui/utils';
import { prove, verify } from '../pkg/nodejs/vortex';

import invariant from 'tiny-invariant';

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

  const extDataHashBigInt = bytesToBigInt(reverseBytes(extDataHash));

  // Prepare circuit input
  const input = toProveInput({
    merkleTree,
    publicAmount,
    extDataHash: extDataHashBigInt,
    nullifier0,
    nullifier1,
    commitment0,
    commitment1,
    vortexKeypair,
    inputUtxo0,
    inputUtxo1,
    outputUtxo0,
    outputUtxo1,
  });

  console.log('Generating proof (this may take 5-15 seconds)...');

  const proofJson = prove(JSON.stringify(input), provingKey);

  return verify(proofJson, verifyingKey);
};

(async () => {
  try {
    const isValid = await deposit();

    invariant(isValid, 'Proof verification failed');

    console.log('SUCCESS!! PROOF VERIFIED');
  } catch (error) {
    console.log(error);
  }
})();
