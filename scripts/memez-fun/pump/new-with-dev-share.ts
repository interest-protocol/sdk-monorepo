import { Transaction } from '@mysten/sui/transactions';

import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x0d75ccd2c50e3f10a051e4c5eada9ce257f378642c3380fb3c3087ba30cf7950';

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
    targetQuoteLiquidity: 2_500n * POW_9,
    liquidityProvision: 380,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
