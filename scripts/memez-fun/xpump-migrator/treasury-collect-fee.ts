import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY =
  '0xaab6feadd3236ecc1b4fa34d00356f0f826f5e3d225818cb738ccdf77dcac979';

const MEME_TYPE =
  '0x8874caed19104ca153d146654bcc3408e531ea7db5cd503bdb194b2b56710119::victory::VICTORY';

const BLUEFIN_POOL =
  '0xdf4c1e5ac010573993a38ee334f125ceb80800db3deefadbde2bc9f1deea9722';

(async () => {
  const { network, executeTx, xPumpMigratorSdk } = await getEnv();
  invariant(network === 'mainnet', 'Only mainnet is supported');
  const { tx } = await xPumpMigratorSdk.treasuryCollectFee({
    bluefinPool: BLUEFIN_POOL,
    memeCoinType: MEME_TYPE,
  });

  await executeTx(tx);
})();
