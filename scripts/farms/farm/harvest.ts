import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { toBase64 } from '@mysten/sui/utils';

const MULTISIG_ADDRESS =
  '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa';

const RECIPIENT =
  '0xb0aa870a5dc5f318430a17b3fd26f7bd83b72ce08d86b8e52eba796681e46768';

(async () => {
  const { farmsSdk, suiClient, farmId, manifestType } = await getEnv();

  const data = await farmsSdk.getAccounts(MULTISIG_ADDRESS);

  const { tx, rewardCoin } = await farmsSdk.harvest({
    farm: farmId,
    account: data[0]!.objectId,
    rewardType: manifestType,
  });

  tx.setSender(MULTISIG_ADDRESS);

  tx.transferObjects([rewardCoin], RECIPIENT);

  const builtTx = await tx.build({
    client: suiClient,
  });

  logSuccess('tx', toBase64(builtTx));
})();
