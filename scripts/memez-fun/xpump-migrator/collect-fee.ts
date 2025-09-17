import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

(async () => {
  const { network, keypair, executeTx, xPumpMigratorSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx, suiCoin } = xPumpMigratorSdk.collectFee({
    bluefinPool:
      '0x35906d9576411093fba737f99a8b563b31cc5cd7a29879cc7cd58ff7384c7631',
    memeCoinType:
      '0x41fe50c9964878ca4274fa798b1118084c2b1af4c3933d3d2ecce63e0611b017::last_test::LAST_TEST',
    positionOwner:
      '0x1f6b7ed76647cb9e0d11c127bb5fd586749cd5768a61c55233c8469c7dc13595',
  });

  tx.transferObjects([suiCoin], tx.pure.address(keypair.toSuiAddress()));

  tx.setSender(keypair.toSuiAddress());

  executeTx(tx);
})();
