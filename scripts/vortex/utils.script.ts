import {
  VortexKeypair,
  Utxo,
  vortexSDK,
  VORTEX_POOL_IDS,
} from '@interest-protocol/vortex-sdk';

import {
  executeTx,
  keypair,
  testnetSuiClient,
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
    suiClient: testnetSuiClient,
    Utxo,
    executeTx,
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
    vortexSdk: vortexSDK,
    suiVortexPoolObjectId: SUI_VORTEX_POOL_OBJECT_ID,
    account:
      '0x3e4604faf9363d4b5b85edd9e3ef3bbcc3391b79623f7656d2f5dac3d9c6d97b',
    secret: 12345n,
    testUSDCType:
      '0x72cfb3ff84f41cc1f222529d4df41ca7803bcc92678303f01eb59b9554cf8434::usdc::USDC',
    testUSDCPoolObjectId:
      '0x91d6bb3b8178e6b2c0f639b3d00933a43e1068a4320933134170ad9fe931c164',
  };
};
