import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY_CAP =
  '0xfa8cd0ecf3e2934785c2a1ea9d4723d075e4b9796a7ce5aa68eb5c152168b96f';

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
    configurationKey: configKeys.MEMEZ,
    metadata: {
      X: 'https://x.com/Meme',
      Website: 'https://meme.xyz/',
      CreatorWallet: recipient,
    },
    developer: recipient,
    memeCoinTreasuryCap: TREASURY_CAP,
    migrationWitness:
      '0xcd8766f0e879a4b5d1c2b0903765b2064d366e805267145ae7ba48d0064d9be6::xpump_migrator::Witness',
    totalSupply: TOTAL_SUPPLY,
    isProtected: false,
    quoteCoinType:
      '0xfd35b96db6d0eb23b8dc4eae97d330d8de85d36ee6a9ab0b35dcb2b7b86cd22a::fake_sui::FAKE_SUI',
    burnTax: 0,
    virtualLiquidity: 500 * 1_000_000_000,
    targetQuoteLiquidity: 2_500 * 1_000_000_000,
    liquidityProvision: 2_500,
    firstPurchase,
  });

  invariant(metadataCap, 'No metadata cap');

  tx.transferObjects([metadataCap], tx.pure.address(recipient));

  await executeTx(tx2);
})();
