import { logSuccess } from '@interest-protocol/logger';
import { makeTideAclSdk } from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE } from '../utils.script';

const TideAclSdk = makeTideAclSdk();

(async () => {
  const isAdmin = await TideAclSdk.isAdmin({
    admin: ADMIN_TO_UPDATE,
  });

  logSuccess('is-admin', isAdmin);
})();
