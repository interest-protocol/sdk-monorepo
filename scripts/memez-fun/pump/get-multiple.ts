import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

const SEXA =
  '0xf25ac8704f323f2c33a7fc8c650da8d7d6620789d9c5f28d0828ea6d971b68d1';

const MANIFEST =
  '0x915cd839f2c87144466c91347c89de81cacce00a61ee5513109c4ce23ed58b13';

(async () => {
  const { pumpSdk } = await getEnv();

  const pools = await pumpSdk.getMultiplePumpPools([SEXA, MANIFEST]);

  logSuccess(pools);
})();
