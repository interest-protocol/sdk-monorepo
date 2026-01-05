import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY =
  '0xaab6feadd3236ecc1b4fa34d00356f0f826f5e3d225818cb738ccdf77dcac979';

const MEME_TYPE =
  '0xf2fafa80fe5fc4d65d03c6de90e743015f6be51990c17adfd0a39216719689d1::cope::COPE';

const BLUEFIN_POOL =
  '0x4023df5f7cd929a7b0af9fc9ecb956b2d620ac437866d627974e7a961e7c4d04';

(async () => {
  const { network, executeTx, xPumpMigratorSdk } = await getEnv();
  invariant(network === 'mainnet', 'Only mainnet is supported');
  const { tx } = await xPumpMigratorSdk.treasuryCollectFee({
    bluefinPool: BLUEFIN_POOL,
    memeCoinType: MEME_TYPE,
  });

  await executeTx(tx);
})();
