import { getEnv } from '../utils.script';
import { logSuccess } from '@interest-protocol/logger';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';
import { SUI_CURRENCY, TEST_SUI_TYPE } from './constants';

(async () => {
  const { keypair, suiClient } = await getEnv();

  const tx = new Transaction();

  const object = await suiClient.getObject({
    id: SUI_CURRENCY,
    options: {
      showContent: true,
    },
  });

  tx.moveCall({
    target: `${SUI_FRAMEWORK_ADDRESS}::coin_registry::finalize_registration`,
    arguments: [
      tx.object('0xc'),
      tx.receivingRef({
        objectId: object.data?.objectId!,
        version: object.data?.version!,
        digest: object.data?.digest!,
      }),
    ],
    typeArguments: [TEST_SUI_TYPE],
  });

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair.signAndExecuteTransaction({
    transaction: tx,
    client: suiClient,
  });

  logSuccess('register', result.digest);
})();
