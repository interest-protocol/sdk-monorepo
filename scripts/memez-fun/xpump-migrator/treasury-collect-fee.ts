import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY =
  '0xaab6feadd3236ecc1b4fa34d00356f0f826f5e3d225818cb738ccdf77dcac979';

const MEME_TYPE =
  '0xbb785e1cdb2f70edf17a1248999f4322ac112be6fddff049bd536592213ceda1::x10::X10';

const BLUEFIN_POOL =
  '0x36ce76842ad2aa160e959c6cd498be201e4b2de33f4278b2f54ad1bb524355be';

(async () => {
  const { network, executeTx, xPumpMigratorSdk } = await getEnv();
  invariant(network === 'mainnet', 'Only mainnet is supported');
  const { tx } = await xPumpMigratorSdk.treasuryCollectFee({
    bluefinPool: BLUEFIN_POOL,
    memeCoinType: MEME_TYPE,
  });

  await executeTx(tx);
})();
