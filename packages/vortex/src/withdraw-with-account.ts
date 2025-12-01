import { Transaction } from '@mysten/sui/transactions';
import { WithdrawWithAccountArgs } from './vortex.types';
import { prepareWithdraw } from './utils/withdraw';

export const withdrawWithAccount = async ({
  tx = new Transaction(),
  unspentUtxos = [],
  vortexPool,
  vortexKeypair,
  merkleTree,
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
    merkleTree,
    recipient,
    relayer,
    relayerFee,
    vortexSdk,
    accountSecret,
  });

  const { tx: tx4 } = await vortexSdk.transactWithAccount({
    vortexPool: pool,
    tx: tx3,
    proof: moveProof,
    extData: extData,
    account,
    coins: [],
  });

  return tx4;
};
