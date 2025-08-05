import { logSuccess } from '@interest-protocol/logger';
import {
  parsePumpPool,
  poolIdFromInnerStateId,
} from '@interest-protocol/memez-fun-sdk';
import { suiClient } from '@interest-protocol/sui-utils';
import { normalizeStructTag } from '@mysten/sui/utils';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const poolId = await poolIdFromInnerStateId(
    '0x1c65deb3e8f2942017f61c81635bcfcd375aff5906ecc50ef694fdc541c2d994',
    suiClient
  );

  const pool = await pumpSdk.getPumpPool(poolId);

  logSuccess(pool);
})();
