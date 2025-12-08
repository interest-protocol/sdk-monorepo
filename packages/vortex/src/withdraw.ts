import { Transaction } from '@mysten/sui/transactions';
import { WithdrawArgs } from './vortex.types';
import { prepareWithdraw } from './utils/withdraw';

export const withdraw = async ({
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
}: WithdrawArgs) => {
  const {
    tx: tx3,
    moveProof,
    extData,
    vortexPool: pool,
  } = await prepareWithdraw({
    tx,
    amount,
    unspentUtxos,
    vortexPool,
    vortexKeypair,
    root,
    getMerklePathFn,
    recipient,
    relayer,
    relayerFee,
    vortexSdk,
    accountSecret: 0n,
  });

  const zeroSuiCoin = tx3.splitCoins(tx3.gas, [tx3.pure.u64(0n)]);

  return vortexSdk.transact({
    vortexPool: pool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    deposit: zeroSuiCoin,
  });
};
