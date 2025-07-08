import { logSuccess } from '@interest-protocol/logger';
import { TideAclSdk } from '@interest-protocol/tide-amm';

(async () => {
  const isAdmin = await TideAclSdk.isAdmin({
    admin: '0x0',
  });

  logSuccess('is-admin', isAdmin);
})();
