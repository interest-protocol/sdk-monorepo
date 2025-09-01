import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0x12370e99aeef8295436ceb0700e32cbe1c7796e5430d3bbe78cb5d1a6c4eb962';

const TOTAL_SUPPLY = 1_000_000_000_000_000_000n;

(async () => {
  const { configKeys, migratorWitnesses, keypair, pumpSdk, executeTx } =
    await getEnv();

  const recipient = keypair.toSuiAddress();
  const tx = new Transaction();

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
    burnTax: 6_000,
    virtualLiquidity: 500 * 1_000_000_000,
    targetQuoteLiquidity: 2_500 * 1_000_000_000,
    liquidityProvision: 1_350,
    firstPurchase,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
