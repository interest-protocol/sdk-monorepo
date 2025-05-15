import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xb039c228179ce0d2b0fd51237a1c4cff7b3daeea08a3c739e8f9a579960d2ec2';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { stableSdk, executeTx, configKeys, migratorWitnesses, keypair } =
    await getEnv();

  const recipient = keypair.toSuiAddress();

  const tx = new Transaction();

  const { tx: tx2, metadataCap } = await stableSdk.newPool({
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
    targetQuoteLiquidity: 3n * 1_000_000_000n,
    totalSupply: TOTAL_SUPPLY,
    liquidityProvision: 10_000 / 20,
    memeSalePercentage: 3000,
    useTokenStandard: false,
    quoteCoinType: SUI_TYPE_ARG,
    developer: recipient,
    developerAllocation: TOTAL_SUPPLY / 100n,
    vestingDurationMs: 1000n,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
