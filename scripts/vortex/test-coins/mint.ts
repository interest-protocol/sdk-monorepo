import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { Transaction } from '@mysten/sui/transactions';

import { SUI_TREASURY, USDC_TREASURY, TEST_COIN_PACKAGE } from './constants';

(async () => {
  const { keypair, suiClient } = await getEnv();

  const tx = new Transaction();

  const usdcCoin = tx.moveCall({
    target: `${TEST_COIN_PACKAGE}::usdc::mint`,
    arguments: [tx.object(USDC_TREASURY), tx.pure.u64(200n * 1_000_000n)],
  });

  const suiCoin = tx.moveCall({
    target: `${TEST_COIN_PACKAGE}::sui::mint`,
    arguments: [tx.object(SUI_TREASURY), tx.pure.u64(100n * 1_000_000_000n)],
  });

  tx.transferObjects(
    [usdcCoin, suiCoin],
    '0xd2420ad33ab5e422becf2fa0e607e1dde978197905b87d070da9ffab819071d6'
  );

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair.signAndExecuteTransaction({
    transaction: tx,
    client: suiClient,
  });

  logSuccess('register', result.digest);
})();
