import { logSuccess } from '@interest-protocol/logger';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

const MULTISIG_ADDRESS =
  '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa';

const RECIPIENT =
  '0xb84c1d14b60438da558bca70c73d52e8f4de4a0f88504056dcc07c38aa312852';

const COIN_TYPE =
  '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST';

const POW_9 = 10n ** 9n;

(async () => {
  const { suiClient } = await getEnv();

  const tx = new Transaction();

  tx.setSender(MULTISIG_ADDRESS);

  const balance = await suiClient.getBalance({
    owner: MULTISIG_ADDRESS,
    coinType: COIN_TYPE,
  });

  const manifest = coinWithBalance({
    balance: BigInt(balance.totalBalance),
    type: COIN_TYPE,
  })(tx);

  tx.transferObjects([manifest], RECIPIENT);

  const builtTx = await tx.build({
    client: suiClient,
  });

  logSuccess('tx', toBase64(builtTx));
})();
