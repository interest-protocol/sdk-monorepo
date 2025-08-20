import { getEnv } from '../utils.script';

(async () => {
  const { keypair, executeTx, walletSdk, suiClient } = await getEnv();

  const walletAddress = await walletSdk.getWalletAddress(
    keypair.toSuiAddress()
  )!;

  const ownedCoins = await suiClient.getCoins({
    owner: walletAddress!,
    coinType: '0x2::sui::SUI',
  });

  const { tx, object } = await walletSdk.receive({
    type: '0x2::coin::Coin<0x2::sui::SUI>',
    objectId: ownedCoins.data[0]!.coinObjectId,
    wallet: walletAddress!,
  });

  tx.transferObjects([object], keypair.toSuiAddress());

  await executeTx(tx);
})();
