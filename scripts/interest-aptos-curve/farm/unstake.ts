import { FARMS } from '@interest-protocol/interest-aptos-curve';
import { logSuccess } from '@interest-protocol/logger';
import { account, executeTx } from '@interest-protocol/movement-utils';

import { curveMainnetSDK } from '../utils';

(async () => {
  const data = curveMainnetSDK.unstake({
    farm: FARMS[0]!.address.toString(),
    amount: 1196738n,
    recipient: account.accountAddress.toString(),
  });

  const transactionResponse = await executeTx({ data });

  logSuccess('unstake', transactionResponse);
})();
