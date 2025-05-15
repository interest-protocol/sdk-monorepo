import { OWNED_OBJECTS } from '@interest-protocol/interest-stable-swap-sdk';
import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { acl, stableSwapSDK } from '../utils.script';

const LP_COIN_TREASURY_CAP = '';

const LP_COIN_TYPE = '';
const WAL_TYPE = '';
const WWAL_TYPE = '';

(async () => {
  const { tx, returnValues: adminWitness } = await acl.signIn({
    admin: OWNED_OBJECTS.ADMIN,
  });

  const walCoin = coinWithBalance({
    type: WAL_TYPE,
    balance: 5_000_000_000n,
  });

  const wwalCoin = coinWithBalance({
    type: WWAL_TYPE,
    balance: 5_000_000_000n,
  });

  const { returnValues: lpCoin } = await stableSwapSDK.newPool({
    tx,
    lpTreasuryCap: LP_COIN_TREASURY_CAP,
    coins: [walCoin, wwalCoin],
    coinTypes: [WAL_TYPE, WWAL_TYPE, LP_COIN_TYPE],
    adminWitness,
    initialA: 500,
  });

  tx.transferObjects([lpCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
