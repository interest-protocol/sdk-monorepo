import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x30ad016e42e17a142edecac7bbda72fabba9124192e061b5fc41a969be4e085f';

const POW_9 = 10n ** 9n;

const TOTAL_SUPPLY = 1_000_000_000n * POW_9;

(async () => {
  const {
    configKeys,
    migratorWitnesses,
    keypair,
    pumpSdk,
    executeTx,
    fakeSuiTypeArg,
  } = await getEnv();

  const recipient = keypair.toSuiAddress();
  const tx = new Transaction();

  const firstPurchase = coinWithBalance({
    balance: 0,
    type: fakeSuiTypeArg,
  });

  const { tx: tx2, metadataCap } = await pumpSdk.newPool({
    tx,
    configurationKey: configKeys.XPUMP,
    metadata: {
      X: 'https://x.com/Meme',
      Website: 'https://meme.xyz/',
      CreatorWallet: recipient,
    },
    developer: recipient,
    memeCoinTreasuryCap: TREASURY_CAP,
    migrationWitness: migratorWitnesses.XPUMP,
    totalSupply: TOTAL_SUPPLY,
    isProtected: false,
    quoteCoinType: fakeSuiTypeArg,
    burnTax: 0,
    virtualLiquidity: 100n * POW_9,
    targetQuoteLiquidity: 8_000n * POW_9,
    liquidityProvision: 300,
    firstPurchase,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
