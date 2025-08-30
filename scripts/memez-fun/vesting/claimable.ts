import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

const VESTING_ID =
  '0xa34b451da6fcb7c03ebf9851d925ae02c19c571c065c4356f73a8622a76a466f';

(async () => {
  const { vestingSdk } = await getEnv();

  const vesting = await vestingSdk.calculateClaimable(VESTING_ID);

  logSuccess('Claimable', vesting);
})();
