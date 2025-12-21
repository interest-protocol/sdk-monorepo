import { Transaction } from '@mysten/sui/transactions';
import { prove, verify } from '.';
import invariant from 'tiny-invariant';
import { VortexKeypair } from '../entities/keypair';
import { Utxo } from '../entities/utxo';
import { fromHex } from '@mysten/sui/utils';
import { toProveInput } from '.';
import { Proof, Action, GetMerklePathFn } from '../vortex.types';
import { Vortex } from '../vortex';
import { VortexKeypair as VortexKeypairType } from '../entities/keypair';

import { VortexPool } from '../vortex.types';

interface PrepareDepositProofArgs {
  tx: Transaction;
  amount: bigint;
  accountSecret: bigint;
  unspentUtxos: Utxo[];
  vortexSdk: Vortex;
  vortexKeypair: VortexKeypairType;
  vortexPool: string | VortexPool;
  getMerklePathFn: GetMerklePathFn;
  relayer: string;
  relayerFee: bigint;
}

export const prepareDepositProof = async ({
  tx,
  amount,
  accountSecret,
  unspentUtxos,
  vortexSdk,
  vortexKeypair,
  vortexPool,
  getMerklePathFn,
  relayer,
  relayerFee,
}: PrepareDepositProofArgs) => {
  const vortexObjectId =
    typeof vortexPool === 'string' ? vortexPool : vortexPool.objectId;

  // Deposits we do not need a recipient, so we use a random one.

  const randomVortexKeypair = VortexKeypair.generate();

  // Determine input UTXOs
  const inputUtxo0 =
    unspentUtxos.length > 0 && unspentUtxos[0].amount > 0n
      ? unspentUtxos[0]
      : new Utxo({
          amount: 0n,
          keypair: vortexKeypair,
          vortexPool: vortexObjectId,
        });

  const inputUtxo1 =
    unspentUtxos.length > 1 && unspentUtxos[1].amount > 0n
      ? unspentUtxos[1]
      : new Utxo({
          amount: 0n,
          keypair: vortexKeypair,
          vortexPool: vortexObjectId,
        });

  const [nextIndex, merklePath0, merklePath1] = await Promise.all([
    vortexSdk.nextIndex(vortexPool),
    getMerklePathFn(inputUtxo0),
    getMerklePathFn(inputUtxo1),
  ]);

  // Calculate output UTXO0 amount: if using unspent UTXOs, include their amounts
  const outputUtxo0 = new Utxo({
    amount: amount + inputUtxo0.amount + inputUtxo1.amount - relayerFee,
    index: nextIndex,
    keypair: vortexKeypair,
    vortexPool: vortexObjectId,
  });

  // Dummy UTXO1 for obfuscation
  const outputUtxo1 = new Utxo({
    amount: 0n,
    index: nextIndex + 1n,
    keypair: vortexKeypair,
    vortexPool: vortexObjectId,
  });

  const [nullifier0, nullifier1, commitment0, commitment1] = [
    inputUtxo0.nullifier(),
    inputUtxo1.nullifier(),
    outputUtxo0.commitment(),
    outputUtxo1.commitment(),
  ];

  const encryptedUtxo0 = VortexKeypair.encryptUtxoFor(
    outputUtxo0.payload(),
    vortexKeypair.encryptionKey
  );

  // UTXO1 is a dummy UTXO for obfuscation, so we use a random Vortex keypair.
  const encryptedUtxo1 = VortexKeypair.encryptUtxoFor(
    outputUtxo1.payload(),
    randomVortexKeypair.encryptionKey
  );

  const root = BigInt(merklePath0.root);

  // Prepare circuit input
  const input = toProveInput({
    vortexObjectId,
    accountSecret,
    root,
    merklePath0: merklePath0.path,
    merklePath1: merklePath1.path,
    publicAmount: amount - relayerFee,
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

  const proofJson: string = prove(JSON.stringify(input));

  const proof: Proof = JSON.parse(proofJson);

  invariant(verify(proofJson), 'Proof verification failed');

  const { extData, tx: tx2 } = vortexSdk.newExtData({
    tx,
    value: amount,
    action: Action.Deposit,
    relayer,
    relayerFee,
    encryptedOutput0: fromHex(encryptedUtxo0),
    encryptedOutput1: fromHex(encryptedUtxo1),
  });

  const { proof: moveProof, tx: tx3 } = await vortexSdk.newProof({
    tx: tx2,
    vortexPool,
    proofPoints: fromHex('0x' + proof.proofSerializedHex),
    root,
    publicValue: amount - relayerFee,
    action: Action.Deposit,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
  });

  return {
    extData,
    tx: tx3,
    moveProof,
    nullifier0,
    nullifier1,
    commitment0,
    commitment1,
  };
};
