import { Transaction } from '@mysten/sui/transactions';
import { Utxo } from '../entities/utxo';
import { VortexKeypair } from '../entities/keypair';
import invariant from 'tiny-invariant';
import { BN } from 'bn.js';
import { normalizeSuiAddress } from '@mysten/sui/utils';

import { fromHex } from '@mysten/sui/utils';
import { toProveInput } from '../utils';
import { BN254_FIELD_MODULUS } from '../constants';
import { prove, verify } from '../utils';
import { Proof, Action, GetMerklePathFn } from '../vortex.types';
import { Vortex } from '../vortex';

interface PrepareWithdrawArgs {
  tx?: Transaction;
  amount: bigint;
  unspentUtxos: Utxo[];
  vortexPool: string | any;
  vortexKeypair: VortexKeypair;
  root: bigint;
  getMerklePathFn: GetMerklePathFn;
  recipient: string;
  relayer: string;
  relayerFee: bigint;
  vortexSdk: Vortex;
  accountSecret: bigint;
}

export const prepareWithdraw = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortexPool,
  vortexKeypair,
  root,
  getMerklePathFn,
  recipient,
  relayer,
  relayerFee,
  vortexSdk,
  accountSecret,
}: PrepareWithdrawArgs) => {
  invariant(unspentUtxos.length >= 1, 'Must have at least 1 unspent UTXO');

  unspentUtxos.sort((a, b) => new BN(b.amount).cmp(new BN(a.amount)));

  const totalUnspentUtxosAmount = unspentUtxos
    .slice(0, 2)
    .reduce((acc, utxo) => acc + utxo.amount, 0n);

  invariant(
    totalUnspentUtxosAmount >= amount,
    'Total unspent UTXOs amount must be greater than or equal to amount'
  );

  const vortexObjectId =
    typeof vortexPool === 'string' ? vortexPool : vortexPool.objectId;

  const randomVortexKeypair = VortexKeypair.generate();

  const inputUtxo0 = unspentUtxos[0];

  const inputUtxo1 =
    unspentUtxos.length > 1 && unspentUtxos[1].amount > 0n
      ? unspentUtxos[1]
      : new Utxo({
          amount: 0n,
          keypair: vortexKeypair,
          vortexPool: vortexObjectId,
        });

  const totalWithdrawAmount = inputUtxo0.amount + inputUtxo1.amount;

  const changeAmount = totalWithdrawAmount - amount;

  const [nextIndex, merklePath0, merklePath1] = await Promise.all([
    vortexSdk.nextIndex(vortexPool),
    getMerklePathFn(inputUtxo0),
    getMerklePathFn(inputUtxo1),
  ]);

  const outputUtxo0 = new Utxo({
    amount: changeAmount,
    index: nextIndex,
    keypair: vortexKeypair,
    vortexPool: vortexObjectId,
  });

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
    changeAmount === 0n
      ? randomVortexKeypair.encryptionKey
      : vortexKeypair.encryptionKey
  );

  // UTXO1 is a dummy UTXO for obfuscation, so we use a random Vortex keypair.
  const encryptedUtxo1 = VortexKeypair.encryptUtxoFor(
    outputUtxo1.payload(),
    randomVortexKeypair.encryptionKey
  );

  // Prepare circuit input
  const input = toProveInput({
    vortexObjectId,
    accountSecret,
    root,
    merklePath0,
    merklePath1,
    publicAmount: BN254_FIELD_MODULUS - amount,
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
    recipient,
    value: amount,
    action: Action.Withdraw,
    relayer: normalizeSuiAddress(relayer),
    relayerFee,
    encryptedOutput0: fromHex(encryptedUtxo0),
    encryptedOutput1: fromHex(encryptedUtxo1),
  });

  const { proof: moveProof, tx: tx3 } = await vortexSdk.newProof({
    vortexPool,
    tx: tx2,
    proofPoints: fromHex('0x' + proof.proofSerializedHex),
    root,
    publicValue: amount,
    action: Action.Withdraw,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
  });

  return {
    tx: tx3,
    moveProof,
    extData,
    vortexPool,
  };
};
