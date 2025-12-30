import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';
import { BN254_FIELD_MODULUS } from './constants';
import { DepositArgs } from './vortex.types';
import { prepareDepositProof } from './utils/deposit';
import { normalizeSuiAddress } from '@mysten/sui/utils';

export const deposit = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortexSdk,
  vortexKeypair,
  vortexPool,
  getMerklePathFn,
  relayer = normalizeSuiAddress('0x0'),
  relayerFee = 0n,
}: DepositArgs) => {
  invariant(unspentUtxos.length <= 2, 'Unspent UTXOs must be at most 2');
  invariant(
    BN254_FIELD_MODULUS > amount,
    'Amount must be less than field modulus'
  );

  const accountSecret = 0n;

  const {
    extData,
    tx: tx2,
    moveProof,
  } = await prepareDepositProof({
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
  });

  const vortexPoolObject = await vortexSdk.resolveVortexPool(vortexPool);

  const deposit = coinWithBalance({
    balance: amount,
    type: vortexPoolObject.coinType,
  })(tx2);

  return vortexSdk.transact({
    vortexPool,
    tx: tx2,
    proof: moveProof,
    extData: extData,
    deposit,
  });
};
