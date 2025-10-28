import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

(async () => {
  const { farmsSdk, pow9, executeTx, farmId, fakeSuiTypeArg } = await getEnv();

  const farm = await farmsSdk.getFarm(farmId);

  const rewardCoin = coinWithBalance({
    balance: 4_000n * pow9,
    type: fakeSuiTypeArg,
  });

  const { tx } = await farmsSdk.addReward({
    farm: farm,
    rewardCoin,
    rewardType: fakeSuiTypeArg,
  });

  await executeTx(tx);
})();
