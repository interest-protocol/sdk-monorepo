import { logSuccess } from '@interest-protocol/logger';
import { getMultipleStateIds } from '@interest-protocol/memez-fun-sdk';
import { getEnv } from '../utils.script';
import { pathOr } from 'ramda';

(async () => {
  const { pumpSdk, suiClient } = await getEnv();

  const stateIds = await getMultipleStateIds(
    [
      '0x37ae1766f9f7846b89867d463989028cefa604d78efc89ee708620d941c054b8',
      '0xdf8702b41149e69e7754b06c16cd33bb2ffa283b78d6269c56fea5ee6e1b93ac',
    ],
    suiClient
  );

  logSuccess(stateIds);
})();
