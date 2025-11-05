import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

(async () => {
  const {
    farmsSdk,
    pow9,
    executeTx,
    farmId,
    manifestType,
    suiClient,
    keypair,
  } = await getEnv();

  const farm = await farmsSdk.getFarm(farmId);

  const manifestBalance = await suiClient.getBalance({
    owner: keypair.toSuiAddress(),
    coinType: manifestType,
  });

  const rewardCoin = coinWithBalance({
    balance: BigInt(manifestBalance.totalBalance),
    type: manifestType,
  });

  const { tx } = await farmsSdk.addReward({
    farm: farm,
    rewardCoin,
    rewardType: manifestType,
  });

  await executeTx(tx);
})();
