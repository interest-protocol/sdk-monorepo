import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';
import { suiClient } from '@interest-protocol/sui-utils';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const BLUEFIN_HELPER_PACKAGE =
  '0x8a76a6925e81835dbdb489279cef3d2b25cd981dcbf8a82546f3d593abb11a36';

(async () => {
  const { executeTx, network, pumpSdk, testnetPoolId } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const tx = new Transaction();

  const pool = await pumpSdk.getPumpPool(testnetPoolId);

  const suiCoinMetadata = await suiClient.getCoinMetadata({
    coinType: SUI_TYPE_ARG,
  });

  const memeCoinMetadata = await suiClient.getCoinMetadata({
    coinType: pool.memeCoinType,
  });

  const suiCoin = coinWithBalance({
    type: SUI_TYPE_ARG,
    balance: 200_000_000n,
  })(tx);

  const memeCoin = coinWithBalance({
    type: pool.memeCoinType,
    balance: 1_000_000_000_000_000n,
  })(tx);

  const feeCoin = coinWithBalance({
    type: SUI_TYPE_ARG,
    balance: 0n,
  })(tx);

  tx.moveCall({
    package: BLUEFIN_HELPER_PACKAGE,
    module: 'bluefin_helper',
    function: 'new_pool',
    typeArguments: [pool.memeCoinType, SUI_TYPE_ARG],
    arguments: [
      tx.object(BLUEFIN_CONFIG.objectId),
      tx.object.clock(),
      tx.object(suiCoinMetadata?.id ?? ''),
      tx.object(memeCoinMetadata?.id ?? ''),
      suiCoin,
      memeCoin,
      feeCoin,
    ],
  });

  await executeTx(tx);
})();
