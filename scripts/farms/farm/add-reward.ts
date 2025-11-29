import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

const COIN_TYPE =
  '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST';

(async () => {
  const { farmsSdk, executeTx, suiClient, keypair, manifestType, farmId } =
    await getEnv();

  const farm = await farmsSdk.getFarm(farmId);

  const rewardBalance = await suiClient.getBalance({
    owner: keypair.toSuiAddress(),
    coinType: manifestType,
  });

  const rewardCoin = coinWithBalance({
    balance: BigInt(rewardBalance.totalBalance),
    type: manifestType,
  });

  const { tx } = await farmsSdk.addReward({
    farm: farm,
    rewardCoin,
    rewardType: manifestType,
  });

  await executeTx(tx);
})();
