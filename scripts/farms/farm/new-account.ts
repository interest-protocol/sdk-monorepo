import { getEnv } from '../utils.script';

(async () => {
  const { farmsSdk, executeTx, farmId, keypair } = await getEnv();

  const { tx, account } = await farmsSdk.newAccount({ farm: farmId });

  tx.transferObjects([account], tx.pure.address(keypair.toSuiAddress()));

  await executeTx(tx);
})();
