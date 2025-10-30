import { getEnv } from '../utils.script';

(async () => {
  const { farmsSdk, executeTx, farmId, keypair, manifestType } = await getEnv();

  const data = await farmsSdk.getAccounts(keypair.toSuiAddress());

  const { tx, rewardCoin } = await farmsSdk.harvest({
    farm: farmId,
    account: data[0]!.objectId,
    rewardType: manifestType,
  });

  tx.transferObjects([rewardCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
