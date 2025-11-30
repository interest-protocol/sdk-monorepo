import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction, TransactionArgument } from '@mysten/sui/transactions';

import { Vortex } from '../vortex';

export const devnetSuiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

export const TEST_VORTEX_PACKAGE_ID =
  '0xe5c3cc57317735311a9e054fa3d59c625d6e530ab9b9499409c4a7157fbfbaba';

export const TEST_VORTEX_SHARED_OBJECT_ID =
  '0x9751819ded69b113eea0ca81b4fcb95be8a07b166a88858ce58057417b5713d3';

export const TEST_REGISTRY_SHARED_OBJECT_ID =
  '0x86b4429f15c699d4a225474be82490f1165c1123228dcfedc6966c245b840ac2';

export const TEST_UPGRADE_CAP_ID =
  '0xb76878578f39017a04a892e7250a146c13663282de80876fae7d62fb5b073f4b';

export const TEST_REGISTRY_INITIAL_SHARED_VERSION = '8';

export const TEST_VORTEX_INITIAL_SHARED_VERSION = '8';

interface ExpectDevInspectTransactionBlockArgs {
  tx: Transaction;
  sender: string;
  expectStatus: 'success' | 'failure';
}

export const expectDevInspectTransactionBlock = async ({
  tx,
  sender,
  expectStatus,
}: ExpectDevInspectTransactionBlockArgs) => {
  const result = await devnetSuiClient.devInspectTransactionBlock({
    sender,
    transactionBlock: tx,
  });

  if (result.effects.status.status !== expectStatus) {
    console.log(result);
  }
  expect(result.effects.status.status).toBe(expectStatus);
};

export const testVortex = new Vortex({
  registry: {
    objectId: TEST_REGISTRY_SHARED_OBJECT_ID,
    initialSharedVersion: TEST_REGISTRY_INITIAL_SHARED_VERSION,
  },
  packageId: TEST_VORTEX_PACKAGE_ID,
});

interface AssertValueArgs {
  tx: Transaction;
  typeArguments: string[];
  args: TransactionArgument[];
}

export const assertValueMoveCall = ({
  tx,
  typeArguments,
  args,
}: AssertValueArgs) => {
  tx.moveCall({
    target: `${TEST_VORTEX_PACKAGE_ID}::vortex::assert_value`,
    arguments: args,
    typeArguments: typeArguments,
  });
};
