import { logSuccess } from '@interest-protocol/logger';
import { makeTideAclSdk } from '@interest-protocol/tide-amm';

const TideAclSdk = makeTideAclSdk();

(async () => {
  const isAdmin = await TideAclSdk.isAdmin({
    admin: '0x0',
  });

  logSuccess('is-admin', isAdmin);
})();
