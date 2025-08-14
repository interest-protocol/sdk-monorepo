import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';
import { SHARED_OBJECTS } from '@interest-protocol/memez-fun-sdk';
import { getEnv } from '../utils.script';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';
import { suiClient } from '@interest-protocol/sui-utils';
import { ClmmPoolUtil, MAX_TICK_INDEX } from '@firefly-exchange/library-sui';

(async () => {
  const {
    executeTx,
    network,
    pumpSdk,
    keypair,
    testnetPoolId,

    xPumpMigratorSdk,
  } = await getEnv();

  const tx = new Transaction();

  const pool = await pumpSdk.getPumpPool(
    '0xe74129478aec3913f274c4c2a8fe12f1026683198d5d475426b33f72581a81a2'
  );

  const memeCoinMetadata = await pumpSdk.client.getCoinMetadata({
    coinType: pool.memeCoinType,
  });

  const suiCoin = coinWithBalance({
    type: SUI_TYPE_ARG,
    balance: 2025 * 10 ** 9,
  });

  tx.transferObjects(
    [suiCoin],
    tx.pure.address(
      '0x078a443382c256428d1b2d385674ffea342a93a28d8c75f25b10e778a0b2290b'
    )
  );

  await executeTx(tx);
})();
