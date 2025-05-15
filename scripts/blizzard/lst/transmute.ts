import { SHARED_OBJECTS, TYPES } from '@interest-protocol/blizzard-sdk';
import { executeTx, keypair } from '@interest-protocol/utils';
import { coinWithBalance } from '@mysten/sui/transactions';
import { Transaction } from '@mysten/sui/transactions';

import { blizzardSDK, MAX_BPS, POW_9 } from '../utils.script';

(async () => {
  const txb = new Transaction();

  const amount = POW_9 * 2n;

  const fee = (amount * 21n) / MAX_BPS;

  const amountMinusFee = amount - fee;

  const pWal = coinWithBalance({
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

  const {
    returnValues: [extraLst, wWal],
  } = await blizzardSDK.transmute({
    tx,
    withdrawIXs,
    fromBlizzardStaking: SHARED_OBJECTS.PWAL_STAKING({
      mutable: true,
    }).objectId,
    fromCoin: pWal,
  });

  tx.transferObjects([extraLst, wWal], keypair.toSuiAddress());

  await executeTx(tx);
})();
