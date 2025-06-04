import {
  COIN_TYPES,
  OWNED_OBJECTS,
} from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { acl, stableSwapSDK } from '../utils.script';

const LP_COIN_TREASURY_CAP =
  '0xe50c785b501c1408ab0207561e60d2f23535d233dbc5eb40ed554edc01a1e4fd';

const LP_COIN_TYPE = COIN_TYPES.USDC_SUI_BRIDGE_USDT;
const BASE_TYPE = COIN_TYPES.USDC;
const QUOTE_TYPE = COIN_TYPES.SUI_BRIDGE_USDT;

(async () => {
  const { tx, returnValues: adminWitness } = await acl.signIn({
    admin: OWNED_OBJECTS.ADMIN,
  });

  const baseCoin = coinWithBalance({
    type: BASE_TYPE,
    balance: 5_000_000n,
  });

  const quoteCoin = coinWithBalance({
    type: QUOTE_TYPE,
    balance: 5_000_000n,
  });

  const { returnValues: lpCoin } = await stableSwapSDK.newPool({
    tx,
    lpTreasuryCap: LP_COIN_TREASURY_CAP,
    coins: [baseCoin, quoteCoin],
    coinTypes: [BASE_TYPE, QUOTE_TYPE, LP_COIN_TYPE],
    adminWitness,
    initialA: 20_000,
  });

  tx.transferObjects([lpCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
