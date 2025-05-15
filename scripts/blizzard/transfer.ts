import { executeTx } from '@interest-protocol/sui-utils';
import { Transaction } from '@mysten/sui/transactions';
import invariant from 'tiny-invariant';

(async () => {
  const superAdminRecipient = '';

  invariant(superAdminRecipient, 'superAdminRecipient is not set');

  const tx = new Transaction();
  tx.transferObjects([tx.object('')], superAdminRecipient);

  await executeTx(tx);
})();
