import { logSuccess } from '@interest-protocol/logger';
import { suiClient } from '@interest-protocol/sui-utils';
import { toBase64 } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

const MULTI_SIG_ADDRESS =
  '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa';

(async () => {
  const tx = new Transaction();

  tx.setSender(MULTI_SIG_ADDRESS);

  logSuccess(
    'multi-sig',
    toBase64(
      await tx.build({
        client: suiClient,
      })
    )
  );
})();
