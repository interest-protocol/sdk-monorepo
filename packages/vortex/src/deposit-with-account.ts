import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';
import {
  TREASURY_ADDRESS,
  DEPOSIT_FEE_IN_BASIS_POINTS,
  BASIS_POINTS,
  BN254_FIELD_MODULUS,
} from './constants';
import { DepositWithAccountArgs } from './vortex.types';
import { prepareDepositProof } from './utils/deposit';

export const depositWithAccount = async ({
  tx = new Transaction(),
  unspentUtxos = [],
  vortexSdk,
  vortexKeypair,
  vortexPool,
  merkleTree,
  accountSecret,
  account,
  coinStructs,
}: DepositWithAccountArgs) => {
  const coins = coinStructs.map((coin) => ({
    objectId: coin.coinObjectId,
    version: coin.version,
    digest: coin.digest,
  }));

  const amount = coinStructs.reduce(
    (acc, coin) => acc + BigInt(coin.balance),
    0n
  );

  invariant(unspentUtxos.length <= 2, 'Unspent UTXOs must be at most 2');
  invariant(
    BN254_FIELD_MODULUS > amount,
    'Amount must be less than field modulus'
  );

  const depositFee = (amount * DEPOSIT_FEE_IN_BASIS_POINTS) / BASIS_POINTS;

  invariant(depositFee > 0n, 'Deposit fee must be greater than 0');

  const {
    extData,
    moveProof,
    tx: tx3,
  } = await prepareDepositProof({
    tx,
    amount,
    accountSecret,
    unspentUtxos,
    vortexSdk,
    vortexKeypair,
    vortexPool,
    merkleTree,
  });

  const suiCoinFee = tx3.splitCoins(tx3.gas, [tx3.pure.u64(depositFee)]);

  tx3.transferObjects([suiCoinFee], tx3.pure.address(TREASURY_ADDRESS));

  return vortexSdk.transactWithAccount({
    vortexPool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    account,
    coins,
  });
};
