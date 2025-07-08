import { executeTx, keypair } from '@interest-protocol/sui-utils';
import { Transaction } from '@mysten/sui/transactions';

import { MOCK_SUI_TREASURY_CAP, MOCK_SUI_TYPE } from '../utils.script';

const recipient = keypair.toSuiAddress();

(async () => {
  const tx = new Transaction();

  tx.moveCall({
    package: '0x2',
    module: 'coin',
    function: 'mint_and_transfer',
    typeArguments: [MOCK_SUI_TYPE],
    arguments: [
      tx.object(MOCK_SUI_TREASURY_CAP),
      tx.pure.u64(1_000_000_000 * 10 ** 9),
      tx.pure.address(recipient),
    ],
  });

  await executeTx(tx as any);
})();
