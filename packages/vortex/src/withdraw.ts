import { Transaction } from '@mysten/sui/transactions';
import { WithdrawArgs } from './vortex.types';
import { prepareWithdraw } from './utils/withdraw';
import { SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';

export const withdraw = async ({
  tx = new Transaction(),
  amount,
  unspentUtxos = [],
  vortexPool,
  vortexKeypair,
  getMerklePathFn,
  relayer,
  relayerFee,
  vortexSdk,
}: WithdrawArgs) => {
  const {
    tx: tx2,
    moveProof,
    extData,
    vortexPool: pool,
  } = await prepareWithdraw({
    tx,
    amount,
    unspentUtxos,
    vortexPool,
    vortexKeypair,
    getMerklePathFn,
    relayer,
    relayerFee,
    vortexSdk,
    accountSecret: 0n,
  });

  const vortexPoolObject = await vortexSdk.resolveVortexPool(pool);

  const zeroCoin = tx2.moveCall({
    target: `${SUI_FRAMEWORK_ADDRESS}::coin::zero`,
    typeArguments: [vortexPoolObject.coinType],
  });

  return vortexSdk.transact({
    vortexPool: pool,
    tx: tx2,
    proof: moveProof,
    extData: extData,
    deposit: zeroCoin,
  });
};
