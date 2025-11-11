import { getEnv } from '../utils.script';
import { coinWithBalance } from '@mysten/sui/transactions';

const COIN_TYPE =
  '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA';

(async () => {
  const { farmsSdk, executeTx, suiClient, keypair } = await getEnv();

  const farm = await farmsSdk.getFarm(
    '0xc6721721e6b66f05ab4374257974d8c0f1beef0db089c30bcfb721f0a6874c46'
  );

  const rewardBalance = await suiClient.getBalance({
    owner: keypair.toSuiAddress(),
    coinType: COIN_TYPE,
  });

  const rewardCoin = coinWithBalance({
    balance: BigInt(rewardBalance.totalBalance),
    type: COIN_TYPE,
  });

  const { tx } = await farmsSdk.addReward({
    farm: farm,
    rewardCoin,
    rewardType: COIN_TYPE,
  });

  await executeTx(tx);
})();
