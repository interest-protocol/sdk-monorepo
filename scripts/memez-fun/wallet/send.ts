import { getEnv } from '../utils.script';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';

(async () => {
  const { keypair, executeTx, walletSdk } = await getEnv();

  const tx = new Transaction();

  const coin1 = coinWithBalance({
    balance: 100,
    type: '0x2::sui::SUI',
  });

  const coin2 = coinWithBalance({
    balance: 200,
    type: '0x2::sui::SUI',
  });

  const walletAddress = await walletSdk.getWalletAddress(
    keypair.toSuiAddress()
  );

  tx.transferObjects([coin1, coin2], tx.pure.address(walletAddress!));

  await executeTx(tx);
})();
