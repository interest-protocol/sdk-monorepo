import { Transaction } from '@mysten/sui/transactions';
import { prove, verify } from './prover/vortex';
import invariant from 'tiny-invariant';
import { VortexKeypair } from './entities/keypair';
import { Utxo } from './entities/utxo';
import { TREASURY_ADDRESS } from './constants';
import { computeExtDataHash } from './utils/ext-data';
import { fromHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { bytesToBigInt, reverseBytes, toProveInput } from './utils';
import { Proof, Action, DepositArgs } from './vortex.types';
import { PROVING_KEY, VERIFYING_KEY } from './keys';

export const deposit = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortex,
  vortexKeypair,
  merkleTree,
  depositFee,
  recipient,
}: DepositArgs) => {
  invariant(amount > 0n, 'Amount must be greater than 0');

  const nextIndex = await vortex.nextIndex();

  // Validate unspentUtxos if provided
  invariant(unspentUtxos.length <= 2, 'Unspent UTXOs must be at most 2');

  // Determine input UTXOs
  const inputUtxo0 =
    unspentUtxos.length > 0 && unspentUtxos[0].amount > 0n
      ? unspentUtxos[0]
      : new Utxo({
          amount: 0n,
          keypair: vortexKeypair,
        });

  const inputUtxo1 =
    unspentUtxos.length > 1 && unspentUtxos[1].amount > 0n
      ? unspentUtxos[1]
      : new Utxo({
          amount: 0n,
          keypair: vortexKeypair,
        });

  const depositAmount = amount - depositFee;

  // Calculate public amount: if using unspent UTXOs, include their amounts
  const publicAmount =
    unspentUtxos.length > 0
      ? depositAmount + inputUtxo0.amount + inputUtxo1.amount
      : depositAmount;

  const outputUtxo0 = new Utxo({
    amount: depositAmount,
    index: nextIndex,
    keypair: vortexKeypair,
  });

  const outputUtxo1 = new Utxo({
    amount: 0n,
    index: nextIndex + 1n,
    keypair: vortexKeypair,
  });

  const [nullifier0, nullifier1, commitment0, commitment1] = await Promise.all([
    inputUtxo0.nullifier(),
    inputUtxo1.nullifier(),
    outputUtxo0.commitment(),
    outputUtxo1.commitment(),
  ]);

  const encryptedUtxo0 = VortexKeypair.encryptUtxoFor(
    outputUtxo0.payload(),
    vortexKeypair.encryptionKey
  );

  const encryptedUtxo1 = VortexKeypair.encryptUtxoFor(
    outputUtxo1.payload(),
    vortexKeypair.encryptionKey
  );

  const extDataHash = computeExtDataHash({
    recipient: normalizeSuiAddress(recipient),
    value: depositAmount,
    valueSign: true,
    // No relayer for deposits
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

  const proofJson: string = prove(JSON.stringify(input), PROVING_KEY);

  const proof: Proof = JSON.parse(proofJson);

  invariant(verify(proofJson, VERIFYING_KEY), 'Proof verification failed');

  tx.setSender(recipient);

  const { extData, tx: tx2 } = vortex.newExtData({
    tx,
    recipient,
    value: depositAmount,
    action: Action.Deposit,
    relayer: normalizeSuiAddress('0x0'),
    relayerFee: 0n,
    encryptedOutput0: fromHex(encryptedUtxo0),
    encryptedOutput1: fromHex(encryptedUtxo1),
  });

  const { proof: moveProof, tx: tx3 } = vortex.newProof({
    tx: tx2,
    proofPoints: fromHex('0x' + proof.proofSerializedHex),
    root: merkleTree.root(),
    publicValue: depositAmount,
    action: Action.Deposit,
    extDataHash: extDataHashBigInt,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
  });

  const suiCoinFee = tx3.splitCoins(tx3.gas, [tx3.pure.u64(depositFee)]);
  const suiCoinDeposit = tx3.splitCoins(tx3.gas, [tx3.pure.u64(depositAmount)]);

  tx3.transferObjects([suiCoinFee], tx3.pure.address(TREASURY_ADDRESS));

  const { tx: tx4 } = vortex.transact({
    tx: tx3,
    proof: moveProof,
    extData: extData,
    deposit: suiCoinDeposit,
  });

  return tx4;
};
