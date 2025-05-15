import { getEnv } from '../utils.script';

const TOKEN_ID =
  '0xd2f226f40ea1783ecdef44bf8bcfca372a467d3a0469c3d14d8cb712f08ef210';

(async () => {
  const { pumpSdk, executeTx, testnetPoolId, keypair } = await getEnv();

  const { memeCoin, tx } = await pumpSdk.toCoin({
    pool: testnetPoolId,
    memeToken: TOKEN_ID,
  });

  tx.transferObjects([memeCoin], tx.pure.address(keypair.toSuiAddress()));

  await executeTx(tx);
})();
