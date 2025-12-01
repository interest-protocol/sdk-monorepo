import { Transaction } from '@mysten/sui/transactions';
import { Utxo } from './entities/utxo';
import { VortexKeypair } from './entities/keypair';
import invariant from 'tiny-invariant';
import { BN } from 'bn.js';
import { normalizeSuiAddress } from '@mysten/sui/utils';

import { fromHex } from '@mysten/sui/utils';
import { toProveInput } from './utils';
import { BN254_FIELD_MODULUS } from './constants';
import { prove, verify } from './utils';
import { Proof, Action, WithdrawArgs } from './vortex.types';

export const withdraw = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortexPool,
  vortexKeypair,
  merkleTree,
  recipient,
  relayer,
  relayerFee,
  vortexSdk,
  accountSecret = 0n,
}: WithdrawArgs) => {
  invariant(1 >= unspentUtxos.length, 'Must have at least 1 unspent UTXO');

  unspentUtxos.sort((a, b) => new BN(b.amount).cmp(new BN(a.amount)));

  const totalUnspentUtxosAmount = unspentUtxos
    .slice(0, 2)
    .reduce((acc, utxo) => acc + utxo.amount, 0n);

  invariant(
    totalUnspentUtxosAmount >= amount + relayerFee,
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

  const changeAmount = totalWithdrawAmount - amount - relayerFee;

  const nextIndex = await vortexSdk.nextIndex(vortexPool);

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
    vortexKeypair.encryptionKey
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
    merkleTree,
    publicAmount: BN254_FIELD_MODULUS - (amount + relayerFee),
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
    root: BigInt(merkleTree.root),
    publicValue: amount + relayerFee,
    action: Action.Withdraw,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
  });

  const zeroSuiCoin = tx3.splitCoins(tx3.gas, [tx3.pure.u64(0n)]);

  const { tx: tx4 } = await vortexSdk.transact({
    vortexPool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    deposit: zeroSuiCoin,
  });

  return tx4;
};
