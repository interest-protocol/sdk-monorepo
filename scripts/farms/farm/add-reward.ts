import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

(async () => {
  const { farmsSdk, pow9, executeTx, farmId, manifestType } = await getEnv();

  const farm = await farmsSdk.getFarm(farmId);

  console.log(farm);

  const rewardCoin = coinWithBalance({
    balance: 10n * pow9,
    type: manifestType,
  });

  const { tx } = await farmsSdk.addReward({
    farm: farm,
    rewardCoin,
    rewardType: manifestType,
  });

  await executeTx(tx);
})();
