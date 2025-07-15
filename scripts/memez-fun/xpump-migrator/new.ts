import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x898e3cbad3783e22eae39b3b1db243ee67814d128ffa3918d50f08a45ebaa0e2';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { configKeys, keypair, xPumpMigratorSdk } = await getEnv();

  const recipient = keypair.toSuiAddress();

  const { pumpSdk, executeTx } = await getEnv();

  const { tx } = await xPumpMigratorSdk.registerPool({
    memeCoinTreasuryCap: TREASURY_CAP,
  });

  const { tx: tx2, metadataCap } = await pumpSdk.newPool({
    tx,
    configurationKey: configKeys.XPUMP,
    metadata: {
      X: 'https://x.com/Meme',
      Website: 'https://meme.xyz/',
      GitHub: 'https://github.com/meme',
    },
    memeCoinTreasuryCap: TREASURY_CAP,
    migrationWitness: xPumpMigratorSdk.witness,
    totalSupply: TOTAL_SUPPLY,
    useTokenStandard: false,
    quoteCoinType: SUI_TYPE_ARG,
    burnTax: 0,
    virtualLiquidity: 5_000_000_000,
    targetQuoteLiquidity: 100_000_000,
    liquidityProvision: 0,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
