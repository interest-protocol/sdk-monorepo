import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY =
  '0xb0aa870a5dc5f318430a17b3fd26f7bd83b72ce08d86b8e52eba796681e46768';

const MEME_TYPE =
  '0xf2fafa80fe5fc4d65d03c6de90e743015f6be51990c17adfd0a39216719689d1::cope::COPE';

const BLUEFIN_POOL =
  '0x4023df5f7cd929a7b0af9fc9ecb956b2d620ac437866d627974e7a961e7c4d04';

(async () => {
  const { network, executeTx, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx, memeCoin, suiCoin } =
    await xPumpMigratorSdk.treasuryCollectPositionV2Fee({
      bluefinPool: BLUEFIN_POOL,
      memeCoinType: MEME_TYPE,
    });

  tx.transferObjects([suiCoin, memeCoin], tx.pure.address(TREASURY));

  await executeTx(tx);
})();
