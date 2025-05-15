import { normalizeSuiAddress, SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x82bd47bbfc0f242a5aa953aec74f248283635b6c987161172b8e32c773f81f85';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

const TOKEN_CREATOR = '0x1';

const VIDEO_CREATOR = '0x2';

(async () => {
  const { configKeys, keypair, recrdMigratorSdk } = await getEnv();

  const recipient = keypair.toSuiAddress();

  const { pumpSdk, executeTx } = await getEnv();

  const { tx } = await recrdMigratorSdk.registerPool({
    memeCoinTreasuryCap: TREASURY_CAP,
  });

  const STAKE_HOLDERS = [TOKEN_CREATOR, VIDEO_CREATOR];

  const { tx: tx2, metadataCap } = await pumpSdk.newPool({
    tx,
    configurationKey: configKeys.RECRD,
    metadata: {
      X: 'https://x.com/Meme',
      Website: 'https://meme.xyz/',
      GitHub: 'https://github.com/meme',
      videoUrl: 'https://memez.gg',
    },

    memeCoinTreasuryCap: TREASURY_CAP,
    migrationWitness: recrdMigratorSdk.witness,
    totalSupply: TOTAL_SUPPLY,
    useTokenStandard: false,
    quoteCoinType: SUI_TYPE_ARG,
    burnTax: 0,
    virtualLiquidity: 5_000_000_000,
    targetQuoteLiquidity: 100_000_000,
    liquidityProvision: 0,
    stakeHolders: STAKE_HOLDERS.map((x) => normalizeSuiAddress(x)),
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  const result = await executeTx(tx2);

  console.log(result);
})();
