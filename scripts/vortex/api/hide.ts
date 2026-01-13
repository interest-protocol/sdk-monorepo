import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { poseidon1 } from '@interest-protocol/vortex-sdk';

(async () => {
  const { api, account } = await getEnv();

  const response = await api.hideAccounts({
    accountObjectIds: [
      '0x819347a91f5081e0bcc3f43cadd38b2a81c1b4e590ba14117a3cea5e1eb48bd2',
    ],
    apiKey: process.env.API_KEY!,
  });

  logSuccess('hide-accounts', response);
})();
