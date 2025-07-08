import { executeTx } from '@interest-protocol/sui-utils';
import {
  makeTideAclSdk,
  Roles,
  SUPER_ADMIN,
} from '@interest-protocol/tide-amm';

const TideAclSdk = makeTideAclSdk();

const admin =
  '0xce8d4a16004aaeec7c6fffcc1c83f355c77c3526d24f95e4149442990b4bce66';

(async () => {
  const tx = TideAclSdk.addRole({
    admin,
    role: Roles.Oracle,
    superAdmin: SUPER_ADMIN,
  });

  await executeTx(tx as any);
})();
