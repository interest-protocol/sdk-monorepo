import { executeTx } from '@interest-protocol/sui-utils';
import { Roles, SUPER_ADMIN, TideAclSdk } from '@interest-protocol/tide-amm';

const admin =
  '0x1f3f49d0dad4c8afe411f6b61b1136692b0fb1f48b1bdb851fdc03c3b4de1411';

(async () => {
  const tx = TideAclSdk.addRole({
    admin: admin,
    role: Roles.Oracle,
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
