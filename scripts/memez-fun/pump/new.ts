import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xf3bd613b87222f1c87668bf7242e30850578c57fc322681f3d97aca164bda78a';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { configKeys, migratorWitnesses, keypair } = await getEnv();

  const recipient = keypair.toSuiAddress();
  const tx = new Transaction();

  const { pumpSdk, executeTx } = await getEnv();

  const { tx: tx2, metadataCap } = await pumpSdk.newPool({
    tx,
    configurationKey: configKeys.MEMEZ,
    metadata: {
      X: 'https://x.com/Meme',
      Website: 'https://meme.xyz/',
      GitHub: 'https://github.com/meme',
      videoUrl: 'https://memez.gg',
    },

    memeCoinTreasuryCap: TREASURY_CAP,
    migrationWitness: migratorWitnesses.TEST,
    totalSupply: TOTAL_SUPPLY,
    useTokenStandard: false,
    quoteCoinType: SUI_TYPE_ARG,
    burnTax: 0,
    virtualLiquidity: 5_000_000_000,
    targetQuoteLiquidity: 3_000_000_000,
    liquidityProvision: 0,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  const result = await executeTx(tx2);

  console.log(result);
})();
