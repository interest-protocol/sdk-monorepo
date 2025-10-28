import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { farmsSdk, keypair, executeTx } = await getEnv();

  const data = await farmsSdk.getAccounts(keypair.toSuiAddress());

  const { tx } = await farmsSdk.destroyAccount({
    account: data[0]!.objectId,
    stakeCoinType: data[0]!.stakeCoinType,
  });

  await executeTx(tx);
})();
