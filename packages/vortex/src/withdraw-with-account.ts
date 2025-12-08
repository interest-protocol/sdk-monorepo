import { Transaction } from '@mysten/sui/transactions';
import { WithdrawWithAccountArgs } from './vortex.types';
import { prepareWithdraw } from './utils/withdraw';

export const withdrawWithAccount = async ({
  tx = new Transaction(),
  unspentUtxos = [],
  vortexPool,
  vortexKeypair,
  root,
  getMerklePathFn,
  recipient,
  relayer,
  relayerFee,
  vortexSdk,
  account,
  accountSecret,
  amount,
}: WithdrawWithAccountArgs) => {
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
    accountSecret,
  });

  return vortexSdk.transactWithAccount({
    vortexPool: pool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    account,
    coins: [],
  });
};
