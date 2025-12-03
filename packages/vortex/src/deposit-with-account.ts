import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';
import { BN254_FIELD_MODULUS } from './constants';
import { DepositWithAccountArgs } from './vortex.types';
import { prepareDepositProof } from './utils/deposit';
import { normalizeSuiAddress } from '@mysten/sui/utils';

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
  relayer = normalizeSuiAddress('0x0'),
  relayerFee = 0n,
}: DepositWithAccountArgs) => {
  const coins = coinStructs.map((coin) => ({
    objectId: coin.coinObjectId,
    version: coin.version,
    digest: coin.digest,
  }));

  let amount = coinStructs.reduce(
    (acc, coin) => acc + BigInt(coin.balance),
    0n
  );

  invariant(unspentUtxos.length <= 2, 'Unspent UTXOs must be at most 2');
  invariant(
    BN254_FIELD_MODULUS > amount,
    'Amount must be less than field modulus'
  );

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
    relayer,
    relayerFee,
  });

  return vortexSdk.transactWithAccount({
    vortexPool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    account,
    coins,
  });
};
