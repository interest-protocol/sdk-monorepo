import { getEnv } from '../utils.script';

import { logSuccess } from '@interest-protocol/logger';

const NULLIFIER =
  '431512285148141030623716587435245115361330462293928376387107877782063497270';

(async () => {
  const { vortexSdk } = await getEnv();

  const nullifierHash = await vortexSdk.hashNullifier(NULLIFIER);

  logSuccess('nullifierHash', nullifierHash);
})();
