import { executeTx } from '@interest-protocol/sui-utils';
import {
  REGISTRY_OBJECT,
  TIDE_AMM_PACKAGE,
  TideAclSdk,
} from '@interest-protocol/tide-amm';
import { Transaction } from '@mysten/sui/transactions';
import { coinWithBalance } from '@mysten/sui/transactions';

import {
  MOCK_SUI_COIN_METADATA,
  MOCK_SUI_TYPE,
  MOCK_USDC_COIN_METADATA,
  MOCK_USDC_TYPE,
} from '../utils.script';

(async () => {
  const tx = new Transaction();

  const { tx: tx2, authWitness } = TideAclSdk.signIn({
    tx,
    admin: '0xce8d4a16004aaeec7c6fffcc1c83f355c77c3526d24f95e4149442990b4bce66',
  });

  const suiCoin = coinWithBalance({
    type: MOCK_SUI_TYPE,
    balance: 5_000 * 10 ** 9,
  })(tx2);

  const usdcCoin = coinWithBalance({
    type: MOCK_USDC_TYPE,
    balance: 20_000 * 10 ** 6,
  })(tx2);

  const pool = tx2.moveCall({
    package: TIDE_AMM_PACKAGE,
    module: 'tide_amm',
    function: 'new',
    typeArguments: [MOCK_SUI_TYPE, MOCK_USDC_TYPE],
    arguments: [
      tx.object(REGISTRY_OBJECT({ mutable: true }).objectId),
      tx.object(MOCK_SUI_COIN_METADATA),
      tx.object(MOCK_USDC_COIN_METADATA),
      tx.pure.u256(40_000 * 10 ** 6),
      authWitness,
    ],
  });

  tx2.moveCall({
    package: TIDE_AMM_PACKAGE,
    module: 'tide_amm',
    function: 'deposit',
    typeArguments: [MOCK_SUI_TYPE, MOCK_USDC_TYPE],
    arguments: [pool, suiCoin, usdcCoin, authWitness],
  });

  tx2.moveCall({
    package: TIDE_AMM_PACKAGE,
    module: 'tide_amm',
    function: 'share',
    arguments: [pool],
  });

  await executeTx(tx as any);
})();
