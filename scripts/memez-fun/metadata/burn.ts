import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

(async () => {
  const { pumpSdk, keypair, executeTx } = await getEnv();

  const caps = await pumpSdk.getMetadataCaps({
    owner: keypair.toSuiAddress(),
  });

  const cap = caps.caps[0]!;

  const memeCoin = coinWithBalance({
    type: cap.coinType,
    balance: 1n,
  });

  const { tx } = await pumpSdk.burnMeme({
    ipxTreasury: cap.ipxTreasury,
    memeCoin,
    coinType: cap.coinType,
  });

  await executeTx(tx);
})();
