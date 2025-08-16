import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xbc8e3091621fe8a355ded4af7bdecfb3370f1d9dd7fe0ac9c5ff1e6069066bb6';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { configKeys, migratorWitnesses, keypair } = await getEnv();

  const recipient = keypair.toSuiAddress();
  const tx = new Transaction();

  const { pumpSdk, executeTx } = await getEnv();

  const firstPurchase = coinWithBalance({
    balance: 0,
    type: '0xfd35b96db6d0eb23b8dc4eae97d330d8de85d36ee6a9ab0b35dcb2b7b86cd22a::fake_sui::FAKE_SUI',
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
    quoteCoinType:
      '0xfd35b96db6d0eb23b8dc4eae97d330d8de85d36ee6a9ab0b35dcb2b7b86cd22a::fake_sui::FAKE_SUI',
    burnTax: 0,
    virtualLiquidity: 500 * 1_000_000_000,
    targetQuoteLiquidity: 2_500 * 1_000_000_000,
    liquidityProvision: 500,
    firstPurchase,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
