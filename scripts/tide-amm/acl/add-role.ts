import { executeTx } from '@interest-protocol/sui-utils';
import {
  makeTideAclSdk,
  Roles,
  SUPER_ADMIN,
} from '@interest-protocol/tide-amm';

import { ADMIN_TO_UPDATE } from '../utils.script';

const TideAclSdk = makeTideAclSdk();

const admin = ADMIN_TO_UPDATE;

(async () => {
  const tx = TideAclSdk.addRole({
    admin,
    role: Roles.Manager,
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
