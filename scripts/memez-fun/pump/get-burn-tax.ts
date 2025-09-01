import { logSuccess } from '@interest-protocol/logger';

import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, testnetPoolId } = await getEnv();

  // Inner state or state id
  const burnTaxes = await pumpSdk.getMultiplePoolsBurnTax([
    '0x16e58c67509c4aa00511a33f22da9940a5f5b5b8d9b2f2e2bb2e2dcbe0932301',
  ]);

  logSuccess({
    burnTaxes,
  });
})();
