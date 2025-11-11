import { getEnv } from '../utils.script';

(async () => {
  const {
    farmsSdk,
    manifestType,
    aclSdk,
    memezOwnedObjects,
    executeTx,
    farmId,
    pow9,
  } = await getEnv();

  const { tx, authWitness } = await aclSdk.signIn({
    admin: memezOwnedObjects.ADMIN,
  });

  const oneYearInSeconds = 31_556_952;

  const { tx: tx2 } = await farmsSdk.setRewardsPerSecond({
    tx: tx as any,
    farm: '0xc6721721e6b66f05ab4374257974d8c0f1beef0db089c30bcfb721f0a6874c46',
    rewardType:
      '0xcee208b8ae33196244b389e61ffd1202e7a1ae06c8ec210d33402ff649038892::aida::AIDA',
    rewardsPerSecond: 3168873850n,
    adminWitness: authWitness,
  });

  await executeTx(tx2);
})();
