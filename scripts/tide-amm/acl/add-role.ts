import { executeTx } from '@interest-protocol/sui-utils';
import {
  makeTideAclSdk,
  Roles,
  SUPER_ADMIN,
} from '@interest-protocol/tide-amm';

import { JOSE_ADMIN } from '../utils.script';

const TideAclSdk = makeTideAclSdk();

const admin = JOSE_ADMIN;

(async () => {
  const tx = TideAclSdk.addRole({
    admin,
    role: Roles.Manager,
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
