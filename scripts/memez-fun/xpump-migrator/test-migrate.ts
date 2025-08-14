import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';
import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';

(async () => {
  const { executeTx, network, pumpSdk, keypair, testnetPoolId, suiClient } =
    await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const { tx, migrator } = await pumpSdk.migrate({
    pool: testnetPoolId,
  });

  const fee = tx.splitCoins(tx.gas, [0n]);

  const memeCoinMetadata = await suiClient.getCoinMetadata({
    coinType: pool.memeCoinType,
  });

  const quoteCoinMetadata = await suiClient.getCoinMetadata({
    coinType: pool.quoteCoinType,
  });

  invariant(memeCoinMetadata?.id, 'Meme coin id is not Bluefin');
  invariant(quoteCoinMetadata?.id, 'Quote coin id is not SUI');

  const quoteCoin = tx.moveCall({
    target: `0x4871c111ea8a756e635f749ff46e089195fa4150852caa10076f64772371a7cb::xpump_migrator::migrate_to_new_pool`,
    typeArguments: [pool.memeCoinType, pool.quoteCoinType, SUI_TYPE_ARG],
    arguments: [
      tx.object(
        '0x393f070ba268d0b605106c5caf894c1903e3fecb86448dcfc285a063257451f1'
      ),
      tx.object(BLUEFIN_CONFIG.objectId),
      tx.object.clock(),
      tx.object(pool.ipxMemeCoinTreasury),
      tx.object(quoteCoinMetadata.id),
      tx.object(memeCoinMetadata.id),
      migrator,
      fee,
    ],
  });

  tx.transferObjects([quoteCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
