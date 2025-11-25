import { Transaction } from '@mysten/sui/transactions';
import { prove, verify } from './prover/vortex';
import invariant from 'tiny-invariant';
import { VortexKeypair } from './entities/keypair';
import { Utxo } from './entities/utxo';
import {
  TREASURY_ADDRESS,
  DEPOSIT_FEE_IN_BASIS_POINTS,
  BASIS_POINTS,
  BN254_FIELD_MODULUS,
} from './constants';
import { computeExtDataHash } from './utils/ext-data';
import { fromHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { bytesToBigInt, reverseBytes, toProveInput } from './utils';
import { Proof, Action, DepositArgs } from './vortex.types';
import { PROVING_KEY, VERIFYING_KEY } from './keys';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export const deposit = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortex,
  vortexKeypair,
  merkleTree,
}: DepositArgs) => {
  invariant(unspentUtxos.length <= 2, 'Unspent UTXOs must be at most 2');
  invariant(
    BN254_FIELD_MODULUS > amount,
    'Amount must be less than field modulus'
  );

  const depositFee = (amount * DEPOSIT_FEE_IN_BASIS_POINTS) / BASIS_POINTS;

  invariant(depositFee > 0n, 'Deposit fee must be greater than 0');

  // Deposits we do not need a recipient, so we use a random one.
  const randomRecipient = normalizeSuiAddress(
    Ed25519Keypair.generate().toSuiAddress()
  );
  const randomVortexKeypair = VortexKeypair.generate();

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

  const publicAmount = amount - depositFee;
  const nextIndex = await vortex.nextIndex();

  // Calculate output UTXO0 amount: if using unspent UTXOs, include their amounts
  const outputUtxo0 = new Utxo({
    amount:
      unspentUtxos.length > 0
        ? publicAmount + inputUtxo0.amount + inputUtxo1.amount
        : publicAmount,
    index: nextIndex,
    keypair: vortexKeypair,
  });

  // Dummy UTXO1 for obfuscation
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

  // UTXO1 is a dummy UTXO for obfuscation, so we use a random Vortex keypair.
  const encryptedUtxo1 = VortexKeypair.encryptUtxoFor(
    outputUtxo1.payload(),
    randomVortexKeypair.encryptionKey
  );

  const extDataHash = computeExtDataHash({
    recipient: randomRecipient,
    value: publicAmount,
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

  const { extData, tx: tx2 } = vortex.newExtData({
    tx,
    recipient: randomRecipient,
    value: publicAmount,
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
    publicValue: publicAmount,
    action: Action.Deposit,
    extDataHash: extDataHashBigInt,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,
  });

  const [suiCoinDeposit, suiCoinFee] = tx3.splitCoins(tx3.gas, [
    tx3.pure.u64(publicAmount),
    tx3.pure.u64(depositFee),
  ]);

  tx3.transferObjects([suiCoinFee], tx3.pure.address(TREASURY_ADDRESS));

  const { tx: tx4 } = vortex.transact({
    tx: tx3,
    proof: moveProof,
    extData: extData,
    deposit: suiCoinDeposit,
  });

  return tx4;
};
