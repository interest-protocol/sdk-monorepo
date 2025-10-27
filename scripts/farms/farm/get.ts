import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { farmsSdk, farmId } = await getEnv();

  const data = await farmsSdk.getFarm(farmId);

  logSuccess(data);
})();
