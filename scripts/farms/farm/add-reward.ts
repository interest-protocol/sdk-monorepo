import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

const COIN_TYPE =
  '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA';

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
