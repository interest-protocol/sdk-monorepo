import { getEnv } from '../utils.script';
import { Transaction } from '@mysten/sui/transactions';

(async () => {
  const { pumpSdk, keypair, executeTx } = await getEnv();

  const caps = await pumpSdk.getMetadataCaps({
    owner: keypair.toSuiAddress(),
  });

  const cap = caps.caps[19]!;

  // Need to ask graphQl {cap.coinType} to get poolId
  // Or go from poolId => sdk.getPumpPool => find {cap.ipxTreasury} === {pool.ipxMemeCoinTreasury}
  const poolId =
    '0x7bb6af7618693ae6eef994eb76a595abdc7d0c156370ecebf65960d8a950d416';

  const { tx } = await pumpSdk.updatePoolMetadata({
    pool: poolId,
    newNames: ['name111'],
    newValues: ['test111'],
    metadataCap: cap.objectId,
  });

  await executeTx(tx);
})();
