import {
  VortexKeypair,
  Utxo,
  vortexSDK,
  VORTEX_POOL_IDS,
} from '@interest-protocol/vortex-sdk';

import {
  executeTx,
  keypair,
  devnetSuiClient,
  devInspectTransactionBlock,
} from '@interest-protocol/sui-utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

const relayerKeypair = Ed25519Keypair.fromSecretKey(process.env.RELAYER_KEY!);
const recipientKeypair = Ed25519Keypair.fromSecretKey(
  process.env.RECIPIENT_KEY!
);

const SUI_VORTEX_POOL_OBJECT_ID = VORTEX_POOL_IDS[SUI_TYPE_ARG];

export const getEnv = async () => {
  return {
    VortexKeypair,
    relayerKeypair,
    recipientKeypair,
    suiClient: devnetSuiClient,
    Utxo,
    executeTx,
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
    vortexSdk: vortexSDK,
    suiVortexPoolObjectId: SUI_VORTEX_POOL_OBJECT_ID,
    account:
      '0xaf329ae99ed1bd423c1d8bc9c38d47e826a0f8714c3cc4c3ecf8d753d5c2c9d9',
    secret: 12345n,
  };
};
