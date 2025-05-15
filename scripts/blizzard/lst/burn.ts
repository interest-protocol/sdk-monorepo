import { SHARED_OBJECTS, TYPES } from '@interest-protocol/blizzard-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { coinWithBalance } from '@mysten/sui/transactions';
import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';

import { blizzardSDK, MAX_BPS, POW_9 } from '../utils.script';

(async () => {
  const txb = new Transaction();

  const amount = POW_9 * 2n;

  const fee = (amount * 1n) / MAX_BPS;

  const amountMinusFee = amount - fee;

  const wal = coinWithBalance({
    type: TYPES.PWAL,
    balance: amount,
  })(txb);

  const {
    returnValues: [, withdrawIXs],
    tx,
  } = await blizzardSDK.fcfs({
    tx: txb,
    value: amountMinusFee,
    blizzardStaking: SHARED_OBJECTS.PWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  invariant(withdrawIXs, 'withdrawIXs is required');

  const {
    returnValues: [extraLst, stakedWalVector],
  } = await blizzardSDK.burnLst({
    tx,
    lstCoin: wal,
    withdrawIXs,
    blizzardStaking: SHARED_OBJECTS.PWAL_STAKING({
      mutable: true,
    }).objectId,
  });

  invariant(extraLst, 'extraLst is required');

  tx.transferObjects([extraLst], keypair.toSuiAddress());

  invariant(stakedWalVector, 'stakedWalVector is required');

  blizzardSDK.vectorTransferStakedWal({
    tx,
    vector: stakedWalVector,
    to: keypair.toSuiAddress(),
  });

  await executeTx(tx);
})();
