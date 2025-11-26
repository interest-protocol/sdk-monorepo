import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { getEnv } from '../utils.script';

(async () => {
  const { keypair } = await getEnv();

  const testnetSuiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  const devnetSuiClient = new SuiClient({
    url: getFullnodeUrl('devnet'),
  });

  const tx = new Transaction();

  tx.moveCall({
    target: `${SUI_FRAMEWORK_ADDRESS}::poseidon::poseidon_bn254`,
    arguments: [tx.pure.vector('u256', [1n, 2n, 3n])],
  });

  tx.setSender(keypair.toSuiAddress());

  const result = await keypair
    .signAndExecuteTransaction({
      transaction: tx,
      client: testnetSuiClient,
    })
    .catch((error) => {
      return {
        effects: {
          status: {
            status: 'testnet-failure',
            error: error.message,
          },
        },
      };
    });

  const result2 = await keypair
    .signAndExecuteTransaction({
      transaction: tx,
      client: devnetSuiClient,
    })
    .catch((error) => {
      return {
        effects: {
          status: {
            status: 'devnet-failure',
            error: error.message,
          },
        },
      };
    });

  console.log('devnet', result2.effects.status);
  console.log('testnet', result.effects.status);
})();
