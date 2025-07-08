import { logSuccess } from '@interest-protocol/logger';
import { executeTx } from '@interest-protocol/sui-utils';
import { SUPER_ADMIN, TideAclSdk } from '@interest-protocol/tide-amm';
import invariant from 'tiny-invariant';

const recipient =
  '0x0db8426f6207d23dc75352be968894e986d156d017ba1a217fcb521effcde94f';

(async () => {
  invariant(recipient, 'recipient is required');
  const tx = TideAclSdk.addRole({
    admin: recipient,
    role: Roles.Manager,
  });

  const result = await executeTx(tx as any);

  logSuccess('new-admin', result);
})();
