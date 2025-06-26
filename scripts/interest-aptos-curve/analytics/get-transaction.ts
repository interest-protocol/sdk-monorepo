import { logSuccess } from '@interest-protocol/logger';
import { movementMainnetClient } from '@interest-protocol/movement-core-sdk';

(async () => {
  const transactions = await movementMainnetClient.getTransactionByVersion({
    ledgerVersion: 11554489,
  });

  logSuccess('get transaction by version', transactions);
})();
