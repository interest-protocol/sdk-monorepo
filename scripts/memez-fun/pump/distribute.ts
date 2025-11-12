import { getEnv } from '../utils.script';

(async () => {
  const { pumpSdk, executeTx, testnetPoolId } = await getEnv();

  const { tx } = await pumpSdk.distributeStakeHoldersAllocation({
    pool: '0xff7fcfa2fdb96f0b3993ed3a142440c815be66eabd005ee7c4216a15a7d51662',
  });

  await executeTx(tx);
})();
