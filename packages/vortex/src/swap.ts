import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { StartSwapHelperArgs, FinishSwapHelperArgs } from './vortex.types';

import { prepareWithdraw } from './utils/withdraw';
import { prepareDepositProof } from './utils/deposit';

export const startSwap = async ({
  tx = new Transaction(),
  amount,
  vortexPool,
  unspentUtxos,
  vortexKeypair,
  root,
  getMerklePathFn,
  relayer,
  minAmountOut,
  vortexSdk,
  coinOutType,
}: StartSwapHelperArgs) => {
  const {
    tx: tx2,
    moveProof,
    extData,
    vortexPool: pool,
  } = await prepareWithdraw({
    tx,
    amount,
    vortexPool,
    unspentUtxos,
    vortexKeypair,
    root,
    getMerklePathFn,
    relayer,
    relayerFee: 0n,
    vortexSdk,
    accountSecret: 0n,
  });

  return vortexSdk.startSwap({
    tx: tx2,
    vortex: pool,
    proof: moveProof,
    extData,
    relayer,
    minAmountOut,
    coinOutType,
  });
};

export const finishSwap = async ({
  tx = new Transaction(),
  amount,
  vortexSdk,
  vortexPool,
  vortexKeypair,
  root,
  getMerklePathFn,
  unspentUtxos,
  coinOut,
  receipt,
  coinInType,
}: FinishSwapHelperArgs) => {
  const accountSecret = 0n;

  const {
    extData,
    tx: tx3,
    moveProof,
  } = await prepareDepositProof({
    tx,
    amount,
    accountSecret,
    unspentUtxos: unspentUtxos ?? [],
    vortexSdk,
    vortexKeypair,
    vortexPool,
    root,
    getMerklePathFn,
    relayer: normalizeSuiAddress('0x0'),
    relayerFee: 0n,
  });

  return vortexSdk.finishSwap({
    tx: tx3,
    vortex: vortexPool,
    coinOut: coinOut,
    proof: moveProof,
    extData,
    receipt,
    coinInType,
  });
};
