import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { Vortex } from '../vortex';

export const devnetSuiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

export const TEST_VORTEX_PACKAGE_ID =
  '0x277955cc8a73834e1f4cd697f3378d859766b0dd4765955639696ac09cc17d2c';

export const TEST_VORTEX_SHARED_OBJECT_ID =
  '0x40ddca868d871032c9a193d293b9f23dda08affb3756751ca286f92e1707e08a';

export const TEST_REGISTRY_SHARED_OBJECT_ID =
  '0xe0cd9b658293528a3e3cbdc83d08d2a9e28ff1b51c0143706996b555e6f5c3ec';

export const TEST_UPGRADE_CAP_ID =
  '0x79b724a068c5b73007f791aa4b8cf7a1b5cc66f25ea0bcaa57cd8ea4d7ee560b';

export const TEST_REGISTRY_INITIAL_SHARED_VERSION = '7';

export const TEST_VORTEX_INITIAL_SHARED_VERSION = '7';

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

  expect(result.effects.status.status).toBe(expectStatus);
};

export const testVortex = new Vortex({
  registry: {
    objectId: TEST_REGISTRY_SHARED_OBJECT_ID,
    initialSharedVersion: TEST_REGISTRY_INITIAL_SHARED_VERSION,
  },
  vortex: {
    objectId: TEST_VORTEX_SHARED_OBJECT_ID,
    initialSharedVersion: TEST_VORTEX_INITIAL_SHARED_VERSION,
  },
  packageId: TEST_VORTEX_PACKAGE_ID,
});
