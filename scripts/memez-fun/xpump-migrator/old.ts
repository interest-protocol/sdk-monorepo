import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';
import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';
import { getEnv } from '../utils.script';
import { Network } from '@interest-protocol/sui-core-sdk';

(async () => {
  const {
    executeTx,
    network,
    pumpSdk,
    keypair,
    suiClient,
    testnetPoolId,

    xPumpMigratorSdk,
  } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const pool = await pumpSdk.getPumpPool(
    '0x7bb6af7618693ae6eef994eb76a595abdc7d0c156370ecebf65960d8a950d416'
  );

  const { tx, migrator } = await pumpSdk.migrate({
    pool: '0x7bb6af7618693ae6eef994eb76a595abdc7d0c156370ecebf65960d8a950d416',
  });

  const feeCoin = tx.splitCoins(tx.gas, [0n]);

  const memeCoinMetadata = await suiClient.getCoinMetadata({
    coinType: pool.memeCoinType,
  });

  const quoteCoinMetadata = await suiClient.getCoinMetadata({
    coinType: SUI_TYPE_ARG,
  });

  invariant(memeCoinMetadata?.id, 'Invalid meme coin metadata');
  invariant(quoteCoinMetadata?.id, 'Invalid quote coin metadata');

  const suiCoin = tx.moveCall({
    package:
      '0x9e07351aaad93972600a4b3214f5d7b6507c03e8f5c30fc166fdb03c692243aa',
    module: 'xpump_migrator',
    function: 'migrate_to_new_pool',
    arguments: [
      tx.object(
        '0x33dc7582f05d080e5f83731391dd9371170ed9b8a609d0ff7ce845ddbb892161'
      ),
      tx.sharedObjectRef({
        objectId: BLUEFIN_CONFIG.objectId,
        mutable: true,
        initialSharedVersion: BLUEFIN_CONFIG.initialSharedVersion,
      }),
      tx.object.clock(),
      tx.object(pool.ipxMemeCoinTreasury),
      tx.object(quoteCoinMetadata.id),
      tx.object(memeCoinMetadata.id),
      migrator,
      tx.object(feeCoin),
    ],
    typeArguments: [pool.memeCoinType, SUI_TYPE_ARG],
  });

  tx.transferObjects([suiCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
