import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';
import { suiClient } from '@interest-protocol/sui-utils';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const BLUEFIN_HELPER_PACKAGE =
  '0x8a76a6925e81835dbdb489279cef3d2b25cd981dcbf8a82546f3d593abb11a36';

const MEME_COIN_TYPE =
  '0x55efdcd8a868d728abd5845c9adfdccf84ce4917ea7da92ffd75717920e41da1::test::TEST';

(async () => {
  const { executeTx, network, pumpSdk, testnetPoolId } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const tx = new Transaction();

  const suiCoinMetadata = await suiClient.getCoinMetadata({
    coinType: SUI_TYPE_ARG,
  });

  const memeCoinMetadata = await suiClient.getCoinMetadata({
    coinType: MEME_COIN_TYPE,
  });

  const suiCoin = coinWithBalance({
    type: SUI_TYPE_ARG,
    balance: 200_000_000n,
  })(tx);

  const memeCoin = coinWithBalance({
    type: MEME_COIN_TYPE,
    balance: 400_000_000_000_000n,
  })(tx);

  const feeCoin = coinWithBalance({
    type: SUI_TYPE_ARG,
    balance: 0n,
  })(tx);

  tx.moveCall({
    package: BLUEFIN_HELPER_PACKAGE,
    module: 'bluefin_helper',
    function: 'new_pool',
    typeArguments: [MEME_COIN_TYPE, SUI_TYPE_ARG],
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
