import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

import { Transaction } from '@mysten/sui/transactions';

(async () => {
  const { keypair, executeTx } = await getEnv();

  const tx = new Transaction();

  tx.transferObjects(
    [
      tx.object(
        '0x1f6b7ed76647cb9e0d11c127bb5fd586749cd5768a61c55233c8469c7dc13595'
      ),
    ],
    tx.pure.address(
      '0x96d9a120058197fce04afcffa264f2f46747881ba78a91beb38f103c60e315ae'
    )
  );

  tx.setSender(keypair.toSuiAddress());

  executeTx(tx);
})();
