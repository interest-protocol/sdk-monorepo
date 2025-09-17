import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

const VESTING_ID =
  '0x5538814072dcbe4adfdf09edbd9f1d29140950905c46e23e1a3405a2ed775712';

(async () => {
  const { vestingSdk } = await getEnv();

  const vesting = await vestingSdk.calculateClaimable(VESTING_ID);

  logSuccess('Claimable', vesting);
})();
