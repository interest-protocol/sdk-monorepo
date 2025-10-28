import { getEnv } from '../utils.script';

(async () => {
  const { farmsSdk, executeTx, farmId, keypair, fakeSuiTypeArg } =
    await getEnv();

  const data = await farmsSdk.getAccounts(keypair.toSuiAddress());

  const { tx, rewardCoin } = await farmsSdk.harvest({
    farm: farmId,
    account: data[0]!.objectId,
    rewardType: fakeSuiTypeArg,
  });

  tx.transferObjects([rewardCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
