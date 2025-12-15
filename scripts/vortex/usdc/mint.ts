import { getEnv } from '../utils.script';
import { USDC_PACKAGE_ID, TREASURY_SHARED_OBJECT } from './constants';
import { Transaction } from '@mysten/sui/transactions';

(async () => {
  const { executeTx, suiClient, keypair } = await getEnv();

  const tx = new Transaction();

  const usdcCoin = tx.moveCall({
    target: `${USDC_PACKAGE_ID}::usdc::mint`,
    arguments: [tx.object(TREASURY_SHARED_OBJECT), tx.pure.u64(15_000_000n)],
  });

  tx.transferObjects([usdcCoin], keypair.toSuiAddress());

  await executeTx(tx, suiClient);
})();
