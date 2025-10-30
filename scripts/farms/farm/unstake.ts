import { getEnv } from '../utils.script';

(async () => {
  const { farmsSdk, executeTx, farmId, keypair, pow9 } = await getEnv();

  const data = await farmsSdk.getAccounts(keypair.toSuiAddress());

  const { tx, unstakeCoin } = await farmsSdk.unstake({
    farm: farmId,
    account: data[0]!.objectId,
    amount: (1n * pow9) / 10n,
  });

  tx.transferObjects([unstakeCoin], keypair.toSuiAddress());

  await executeTx(tx);
})();
