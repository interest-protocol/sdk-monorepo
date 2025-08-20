import invariant from 'tiny-invariant';
import { logSuccess } from '@interest-protocol/logger';
import { getEnv } from '../utils.script';

(async () => {
  const { network, keypair, executeTx, walletSdk } = await getEnv();

  invariant(network === 'mainnet', 'Only mainnet is supported');

  const address = await walletSdk.getWalletAddress(keypair.toSuiAddress());

  logSuccess('Wallet address', address);
})();
