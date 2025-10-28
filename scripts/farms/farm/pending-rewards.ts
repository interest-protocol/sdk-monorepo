import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { farmsSdk, keypair } = await getEnv();

  const data = await farmsSdk.getAccounts(keypair.toSuiAddress());

  const rewards = await farmsSdk.pendingRewards(data[0]!.objectId);

  logSuccess(rewards);
})();
