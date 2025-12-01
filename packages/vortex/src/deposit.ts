import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';
import {
  TREASURY_ADDRESS,
  DEPOSIT_FEE_IN_BASIS_POINTS,
  BASIS_POINTS,
  BN254_FIELD_MODULUS,
} from './constants';
import { DepositArgs } from './vortex.types';
import { prepareDepositProof } from './utils/deposit';

export const deposit = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortexSdk,
  vortexKeypair,
  vortexPool,
  merkleTree,
}: DepositArgs) => {
  invariant(unspentUtxos.length <= 2, 'Unspent UTXOs must be at most 2');
  invariant(
    BN254_FIELD_MODULUS > amount,
    'Amount must be less than field modulus'
  );

  const depositFee = (amount * DEPOSIT_FEE_IN_BASIS_POINTS) / BASIS_POINTS;

  invariant(depositFee > 0n, 'Deposit fee must be greater than 0');

  const amountMinusFrontendFee = amount - depositFee;
  const accountSecret = 0n;

  const {
    extData,
    tx: tx3,
    moveProof,
  } = await prepareDepositProof({
    tx,
    amount: amountMinusFrontendFee,
    accountSecret,
    unspentUtxos,
    vortexSdk,
    vortexKeypair,
    vortexPool,
    merkleTree,
  });

  const [suiCoinDeposit, suiCoinFee] = tx3.splitCoins(tx3.gas, [
    tx3.pure.u64(amountMinusFrontendFee),
    tx3.pure.u64(depositFee),
  ]);

  tx3.transferObjects([suiCoinFee], tx3.pure.address(TREASURY_ADDRESS));

  const { tx: tx4 } = await vortexSdk.transact({
    vortexPool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    deposit: suiCoinDeposit,
  });

  return tx4;
};
