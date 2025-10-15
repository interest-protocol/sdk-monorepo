import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xcd0a45dcff53083650c77e4531f04cf24a00ae33cecf974bd3d4b051aae9c607';

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

  const { tx: tx2, metadataCap } = await pumpSdk.newPoolWithDevRevenueShare({
    tx,
    configurationKey: configKeys.XPUMP,
    metadata: {
      X: 'https://x.com/Meme',
      Website: 'https://meme.xyz/',
      CreatorWallet: recipient,
    },
    memeCoinTreasuryCap: TREASURY_CAP,
    migrationWitness: migratorWitnesses.XPUMP,
    totalSupply: TOTAL_SUPPLY,
    isProtected: false,
    quoteCoinType: fakeSuiTypeArg,
    burnTax: 0,
    virtualLiquidity: 100n * POW_9,
    targetQuoteLiquidity: 8_000n * POW_9,
    liquidityProvision: 300,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
