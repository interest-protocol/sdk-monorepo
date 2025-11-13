import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export const devnetSuiClient = new SuiClient({
  url: getFullnodeUrl('devnet'),
});

export const TEST_VORTEX_PACKAGE_ID =
  '0xafd0edcdb3a2b98bc249a5ed71fcb2e087a6cea15588a4de7dad18c0e84660ee';

export const TEST_VORTEX_SHARED_OBJECT_ID =
  '0xf2dbf720046bf32abe7ddbb38173556ad646a307622be2b1ed60aed8b386c7c0';

export const TEST_REGISTRY_SHARED_OBJECT_ID =
  '0xb33262358860e6f82a25f50535195f52ddbb0681f90baae40732fd02d86dd411';

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
