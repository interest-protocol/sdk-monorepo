import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xe330c077347c3a1fcba412c304ed9fddca5f5da0512edcac8e4705f841c95f6d';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { pumpSdk, executeTx, configKeys, migratorWitnesses, keypair } =
    await getEnv();

  const recipient = keypair.toSuiAddress();

  const tx = new Transaction();

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
    useTokenStandard: true,
    quoteCoinType: SUI_TYPE_ARG,
    burnTax: 0,
    virtualLiquidity: 5_000_000_000,
    targetQuoteLiquidity: 3_000_000_000,
    liquidityProvision: 0,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
