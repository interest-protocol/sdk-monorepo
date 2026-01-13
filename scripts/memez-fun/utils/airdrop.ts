import { logSuccess } from '@interest-protocol/logger';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';
import { coinWithBalance } from '@mysten/sui/transactions';

import { getEnv } from '../utils.script';

const MULTISIG_ADDRESS =
  '0xbe222be876a0f09c953b6217fba8b64eb77853ce298513cb3efcfe19bfbaf0aa';

const RECIPIENTS = [
  '0x204128da2dc06e765cdacd39daea34519402f31580eea15ac70b778f866554fa',
  '0xf0e076778d94a119b4b70efd7d98a75d300623bc71d6696d3a838e1a42f8dd48',
  '0x4df9940aecd2e898224aa648f5cf9f0295c93a23f6b8b2f5ee68ed73362db5ee',
  '0xbf575bb2171043211bc89c3c786574ada13ca6e6e9a07773519e4a6f4d4d91be',
  '0xfef5a40df895459e452f2ecf268c4df2c34b8fd7e05b0225b6e464dbf71ef62d',
  '0xf9d2b5eacb75564baaa2f5b752ad56bc8da8b56cb9644226091397eac217c7f1',
  '0x8866369ae2a87b7ce13fb53fd4c5dd35d71a9d5337508b2e747a0674305ed5fb',
  '0x1245ba93a417cc8d268b693d5e4ce758fe9db3615fc89be574f1c2a6370af2cc',
  '0xefaa8a3063312c36f9d8a5071407f3b0383be6ceddbf03741dd2f1e5ced5fe59',
  '0x97ac4c6f0447d37a36728d4ba29dfa9c2ad9cc32302fbbfda4c37bbda363050e',
];

const COIN_TYPE =
  '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST';

const POW_9 = 10n ** 9n;

(async () => {
  const { suiClient } = await getEnv();

  const tx = new Transaction();

  tx.setSender(MULTISIG_ADDRESS);

  RECIPIENTS.forEach(async (recipient) => {
    const manifest = coinWithBalance({
      balance: BigInt(20_000n * POW_9),
      type: COIN_TYPE,
    })(tx);

    tx.transferObjects([manifest], recipient);
  });

  const builtTx = await tx.build({
    client: suiClient,
  });

  logSuccess('tx', toBase64(builtTx));
})();
