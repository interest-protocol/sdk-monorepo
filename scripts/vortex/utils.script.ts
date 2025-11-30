import { VortexKeypair, Utxo, vortexSDK } from '@interest-protocol/vortex-sdk';

import {
  executeTx,
  keypair,
  devnetSuiClient,
  devInspectTransactionBlock,
} from '@interest-protocol/sui-utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const relayerKeypair = Ed25519Keypair.fromSecretKey(process.env.RELAYER_KEY!);
const recipientKeypair = Ed25519Keypair.fromSecretKey(
  process.env.RECIPIENT_KEY!
);

const SUI_VORTEX_POOL_OBJECT_ID =
  '0x3f442283f74552cee1dca31e242fd3f031fb095241056b18ce207ebb1d9d1a8e';

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
  };
};
