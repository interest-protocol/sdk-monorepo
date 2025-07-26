import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';

import { getEnv } from '../utils.script';

(async () => {
  const { suiClient } = await getEnv();

  const tx = new Transaction();

  tx.moveCall({
    package:
      '0xafa22fb0bf987fe79886fe7fc9a670348ff247c6cf897d2a7d01403bad6c547d',
    module: 'config',
    function: 'get_pool_creation_fee_amount',
    arguments: [
      tx.object(
        '0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352'
      ),
    ],
    typeArguments: ['0x2::sui::SUI'],
  });

  const result = await devInspectAndGetReturnValues(suiClient, tx, [
    [bcs.bool(), bcs.u64()],
  ]);

  console.log(result);
})();
