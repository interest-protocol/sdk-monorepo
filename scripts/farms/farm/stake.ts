import { getEnv } from '../utils.script';

import { coinWithBalance } from '@mysten/sui/transactions';

(async () => {
  const { farmsSdk, executeTx, farmId, keypair, pow9 } = await getEnv();

  const data = await farmsSdk.getAccounts(keypair.toSuiAddress());

  const depositCoin = coinWithBalance({
    balance: 10n * pow9,
    type: data[0]!.stakeCoinType,
  });

  const { tx } = await farmsSdk.stake({
    farm: farmId,
    account: data[0]!.objectId,
    depositCoin,
  });

  await executeTx(tx);
})();
