import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  const [pool1, pool2] = await pumpSdk.getMultiplePumpPools([
    testnetPoolId,
    '0x7bb6af7618693ae6eef994eb76a595abdc7d0c156370ecebf65960d8a950d416',
  ]);

  const metadatas = await pumpSdk.getMultiplePoolMetadata([
    {
      poolId: pool1!.objectId,
      quoteCoinType: pool1!.quoteCoinType,
      memeCoinType: pool1!.memeCoinType,
      curveType: pool1!.curveType,
    },
    {
      poolId: pool2!.objectId,
      quoteCoinType: pool2!.quoteCoinType,
      memeCoinType: pool2!.memeCoinType,
      curveType: pool2!.curveType,
    },
  ]);

  logSuccess(metadatas);
})();
