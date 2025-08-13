import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';
import { SHARED_OBJECTS } from '@interest-protocol/memez-fun-sdk';
import { getEnv } from '../utils.script';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';
import { suiClient } from '@interest-protocol/sui-utils';

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
    '0x915cd839f2c87144466c91347c89de81cacce00a61ee5513109c4ce23ed58b13'
  );

  const memeCoinMetadata = await pumpSdk.client.getCoinMetadata({
    coinType: pool.memeCoinType,
  });

  const suiCoin = coinWithBalance({
    type: SUI_TYPE_ARG,
    balance: 0,
  });

  const memeCoin = coinWithBalance({
    type: pool.memeCoinType,
    balance: 0,
  });

  tx.moveCall({
    target:
      '0xbf7b1ccb974271ded8abb4c10f3fa237c351b091b1432b8eaea58169e4c4eb7e::xpump_migrator::add_liquidity_to_existing_pool',
    arguments: [
      tx.sharedObjectRef(
        SHARED_OBJECTS.mainnet.XPUMP_MIGRATOR_CONFIG({
          mutable: true,
        })
      ),
      tx.object(BLUEFIN_CONFIG.objectId),
      tx.object(
        '0x15a1adef56e1b716c29a6ce7df539fd7b8080da283199c92c6caa6f641a61c3f'
      ),
      tx.object.clock(),
      tx.object(pool.ipxMemeCoinTreasury),
      tx.object(memeCoinMetadata?.id! || ''),
      suiCoin,
      memeCoin,
    ],
    typeArguments: [pool.memeCoinType],
  });

  await executeTx(tx);
})();
