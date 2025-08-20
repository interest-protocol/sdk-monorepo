import { getEnv } from '../utils.script';

(async () => {
  const { keypair, executeTx, walletSdk } = await getEnv();

  const { tx } = await walletSdk.newWallet(keypair.toSuiAddress());

  await executeTx(tx);
})();
