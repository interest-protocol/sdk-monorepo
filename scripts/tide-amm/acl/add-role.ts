import { executeTx } from '@interest-protocol/sui-utils';
import {
  makeTideAclSdk,
  Roles,
  SUPER_ADMIN,
} from '@interest-protocol/tide-amm';

import { DEATH_ADMIN } from '../utils.script';

const TideAclSdk = makeTideAclSdk();

const admin = DEATH_ADMIN;

(async () => {
  const tx = TideAclSdk.addRole({
    admin,
    role: Roles.Oracle,
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
