import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';

(async () => {
  const { farmsSdk, keypair } = await getEnv();

  const data = await farmsSdk.getAccounts(
    '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa'
  );

  logSuccess(data);
})();
