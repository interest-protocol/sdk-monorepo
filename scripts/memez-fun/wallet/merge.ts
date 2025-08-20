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

  const { tx } = await walletSdk.mergeCoins({
    coinType: '0x2::sui::SUI',
    coins: ownedCoins.data.map((coin) => ({
      objectId: coin.coinObjectId,
      version: coin.version,
      digest: coin.digest,
    })),
    wallet: walletAddress!,
  });

  await executeTx(tx);
})();
