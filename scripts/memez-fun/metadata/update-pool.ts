import { getEnv } from '../utils.script';
import { Transaction } from '@mysten/sui/transactions';

(async () => {
  const { pumpSdk, keypair, executeTx } = await getEnv();

  const caps = await pumpSdk.getMetadataCaps({
    owner: keypair.toSuiAddress(),
  });

  const cap = caps.caps[20]!;

  // Need to ask graphQl {cap.coinType} to get poolId
  // Or go from poolId => sdk.getPumpPool => find {cap.ipxTreasury} === {pool.ipxMemeCoinTreasury}
  const poolId =
    '0xf5cba9418542203b0f299574fe58693f5c5fea58124d22014c3b53a393b165de';

  const { tx } = await pumpSdk.updatePoolMetadata({
    pool: poolId,
    newNames: ['name111'],
    newValues: ['test111'],
    metadataCap: cap.objectId,
  });

  await executeTx(tx);
})();
