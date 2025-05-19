import { logSuccess } from '@interest-protocol/logger';
import { normalizeSuiAddress, SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xe022dbf6e0347207e37daf934c623f873d7616824c748cba298d6fd75f80c338';

const SENDER =
  '0x0cd77bc1e00ce9b6eb15bbd89d7e4521330c5fa8a170da7d12081a1d0b003a95';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

const TOKEN_CREATOR = '0x1';

const VIDEO_CREATOR = '0x2';

(async () => {
  const { configKeys, keypair, recrdMigratorSdk, suiClient } = await getEnv();

  const recipient = keypair.toSuiAddress();

  const { pumpSdk } = await getEnv();

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

  const { effects } = await suiClient.devInspectTransactionBlock({
    transactionBlock: tx2,
    sender: SENDER,
  });

  logSuccess('Successfully created new pool', effects);
})();
