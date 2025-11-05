import { getEnv } from '../utils.script';
import { toHex } from '@mysten/sui/utils';

(async () => {
  const { farmsSdk, executeTx, farmId, keypair } = await getEnv();

  const { tx, account } = await farmsSdk.newAccount({ farm: farmId });

  tx.transferObjects(
    [account],
    tx.pure.address(
      '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa'
    )
  );

  tx.setSender(keypair.toSuiAddress());

  await executeTx(tx);
})();
