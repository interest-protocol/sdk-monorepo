import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { getEnv } from '../utils.script';

const catchError = (error: any, network: 'testnet' | 'devnet') => ({
  effects: {
    status: {
      status: `${network}-failure`,
      error: error.message,
    },
  },
});

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

  const [resultDevnet, resultTestnet] = await Promise.all([
    keypair
      .signAndExecuteTransaction({
        transaction: tx,
        client: devnetSuiClient,
      })
      .catch((error) => catchError(error, 'devnet')),
    keypair
      .signAndExecuteTransaction({
        transaction: tx,
        client: testnetSuiClient,
      })
      .catch((error) => catchError(error, 'testnet')),
  ]);

  console.log('devnet', resultDevnet.effects.status);
  console.log('testnet', resultTestnet.effects.status);
})();
