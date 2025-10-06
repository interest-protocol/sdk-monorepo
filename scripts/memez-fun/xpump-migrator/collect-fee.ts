import invariant from 'tiny-invariant';
import { logSuccess } from '@interest-protocol/logger';
import { getEnv } from '../utils.script';

(async () => {
  const { network, keypair, xPumpMigratorSdk, devInspectTransactionBlock } =
    await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const { tx, suiCoin } = xPumpMigratorSdk.collectFee({
    bluefinPool:
      '0xe0a0cb9cf19d16a01590420e0bf6351760247ba87916ab1846b5aa36be3122f2',
    memeCoinType:
      '0xefde5ddb743bd93e68a75e410e985980457b5e8837c7f4afa36ecc12bb91022b::mnm::MNM',
    positionOwner:
      '0x23bdcfe9367ee38878d376831a6a9d6718801fbee7e12359bdd6c67c2ea822fc',
  });

  tx.transferObjects([suiCoin], tx.pure.address(keypair.toSuiAddress()));

  tx.setSender(keypair.toSuiAddress());

  logSuccess(
    await devInspectTransactionBlock(
      tx,
      '0x7cd2ee66b1bf2561ba0a8f13515e05d700d4ef90d54adfb6948fec7b0c38a095'
    )
  );
})();
