import { logSuccess } from '@interest-protocol/logger';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { OWNED_OBJECTS } from '@interest-protocol/memez-fun-sdk';

import { getEnv } from '../utils.script';

const MULTISIG_ADDRESS =
  '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa';

const RECIPIENT =
  '0xb0aa870a5dc5f318430a17b3fd26f7bd83b72ce08d86b8e52eba796681e46768';

const COIN_TYPE = '0x2::sui::SUI';

const POW_9 = 10n ** 9n;

(async () => {
  const { suiClient } = await getEnv();

  const tx = new Transaction();

  tx.setSender(MULTISIG_ADDRESS);

  const suiCoin = tx.splitCoins(tx.gas, [tx.pure.u64(6_000n * 1_000_000_000n)]);

  tx.transferObjects([suiCoin], tx.pure.address(RECIPIENT));

  const builtTx = await tx.build({
    client: suiClient,
  });

  logSuccess('tx', toBase64(builtTx));
})();
