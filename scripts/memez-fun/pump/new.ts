import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x9ad8808dad6ed615f639615fe8672a5af9a0b58280926be1b08a6e659a141670';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { configKeys, migratorWitnesses, keypair } = await getEnv();

  const recipient = keypair.toSuiAddress();
  const tx = new Transaction();

  const { pumpSdk, executeTx } = await getEnv();

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
    quoteCoinType: SUI_TYPE_ARG,
    burnTax: 0,
    virtualLiquidity: 5_000_000_000,
    targetQuoteLiquidity: 1_000_000_000,
    liquidityProvision: 0,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
