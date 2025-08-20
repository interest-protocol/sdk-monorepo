import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const TREASURY =
  '0xaab6feadd3236ecc1b4fa34d00356f0f826f5e3d225818cb738ccdf77dcac979';

const MEME_TYPE =
  '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST';

const BLUEFIN_POOL =
  '0x15a1adef56e1b716c29a6ce7df539fd7b8080da283199c92c6caa6f641a61c3f';

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
