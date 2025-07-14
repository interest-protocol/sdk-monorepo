import { executeTx } from '@interest-protocol/sui-utils';
import { PUBLISHER, TIDE_UPGRADE_CAP } from '@interest-protocol/tide-amm';
import { Transaction } from '@mysten/sui/transactions';

(async () => {
  const tx = new Transaction();

  tx.transferObjects(
    [tx.object(PUBLISHER), tx.object(TIDE_UPGRADE_CAP)],
    tx.pure.address(
      '0x3f2bbe286241f23ceba46d2a62a8c2ca6a75bb51c7d4991e6c568f6cee0cf910'
    )
  );

  await executeTx(tx);
})();
