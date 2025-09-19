import invariant from 'tiny-invariant';
import { logSuccess } from '@interest-protocol/logger';
import { getEnv } from '../utils.script';

(async () => {
  const { network, keypair, xPumpMigratorSdk, devInspectTransactionBlock } =
    await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx, suiCoin } = xPumpMigratorSdk.collectFee({
    bluefinPool:
      '0x15a1adef56e1b716c29a6ce7df539fd7b8080da283199c92c6caa6f641a61c3f',
    memeCoinType:
      '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST',
    positionOwner:
      '0x21c3ad5b1c4df66427d7452b4b8204bfd6544e1f015fd37cc30eac45dfdddf22',
  });

  tx.transferObjects([suiCoin], tx.pure.address(keypair.toSuiAddress()));

  tx.setSender(keypair.toSuiAddress());

  logSuccess(
    await devInspectTransactionBlock(
      tx,
      '0x40cdfd49d252c798833ddb6e48900b4cd44eeff5f2ee8e5fad76b69b739c3e62'
    )
  );
})();
