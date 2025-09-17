import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x26cce250b39573ffd16f90f263562d24756dc2095eb312d498821946fdc38220';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { configKeys, migratorWitnesses, keypair, pumpSdk, executeTx } =
    await getEnv();

  const recipient = keypair.toSuiAddress();
  const tx = new Transaction();

  const firstPurchase = coinWithBalance({
    balance: 0,
    type: '0x2::sui::SUI',
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
    quoteCoinType: '0x2::sui::SUI',
    burnTax: 0,
    virtualLiquidity: 500 * 1_000_000_000,
    targetQuoteLiquidity: 1_000_000_000,
    liquidityProvision: 1_350,
    firstPurchase,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
