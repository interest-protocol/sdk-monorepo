import { logSuccess } from '@interest-protocol/logger';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { OWNED_OBJECTS } from '@interest-protocol/memez-fun-sdk';

import { getEnv } from '../utils.script';

const MULTISIG_ADDRESS =
  '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa';

const RECIPIENT =
  '0xbbf31f4075625942aa967daebcafe0b1c90e6fa9305c9064983b5052ec442ef7';

const COIN_TYPE =
  '0x9d5ddbd962c19eb4b7aeb22f82e9b0925c066b7fbc5cc7254051b7b2ffd01f8d::odor::ODOR';

const POW_9 = 10n ** 9n;

(async () => {
  const { suiClient } = await getEnv();

  const tx = new Transaction();

  tx.setSender(MULTISIG_ADDRESS);

  const builtTx = await tx.build({
    client: suiClient,
  });

  logSuccess('tx', toBase64(builtTx));
})();
