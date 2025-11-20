import { VortexKeypair, Utxo, Vortex } from '@interest-protocol/vortex-sdk';

import {
  executeTx,
  keypair,
  devnetSuiClient,
  devInspectTransactionBlock,
} from '@interest-protocol/sui-utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PROVING_KEY } from './proving-key';

export const VORTEX_PACKAGE_ID =
  '0x57e5e6ffdb761c81e42479f16d53b920bdd0ca4ce60dda2aa81657d60f01d55d';

export const VORTEX_POOL_OBJECT_ID =
  '0x63527671f580e4989dccb0a8c0c5ecc8f71445892b26347566ca6db321d13f33';

export const REGISTRY_OBJECT_ID =
  '0x451e45ff25a95682247377802db300e3da0870774208e1a8be2f2b28393c6fe0';

export const INITIAL_SHARED_VERSION = '15';

export interface Env {
  VortexKeypair: typeof VortexKeypair;
  Utxo: typeof Utxo;
  suiClient: SuiClient;
  executeTx: (tx: Transaction, client?: SuiClient) => Promise<void>;
  keypair: Ed25519Keypair;
  POW_10_9: bigint;
  devInspectTransactionBlock: (
    tx: Transaction,
    sender: string,
    client?: SuiClient
  ) => Promise<any>;
  vortex: Vortex;
  verifyingKey: string;
  provingKey: string;
}

export const getEnv = async (): Promise<Env> => {
  return {
    VortexKeypair,
    suiClient: devnetSuiClient,
    Utxo,
    executeTx,
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
    vortex: new Vortex({
      packageId: VORTEX_PACKAGE_ID,
      registry: {
        objectId: REGISTRY_OBJECT_ID,
        initialSharedVersion: INITIAL_SHARED_VERSION,
      },
      vortex: {
        objectId: VORTEX_POOL_OBJECT_ID,
        initialSharedVersion: INITIAL_SHARED_VERSION,
      },
    }),
    verifyingKey:
      '8abc1628853c25306d08b697c715ffab55a9ee43e8fb72cc4a3b6bb74407830c63dc8914a6aa2ef6be195b0b1589ac1ad05ad5ac0ce6e34829f7cb9610340519cbab341c90c5acd97085ba44f27ffa35cf527faa2da9da29019090555ad895895445aab414e17fab2cae2ccb341b42181b3aca24f715ff4501f517d97d14f70161dfe981a5101f528c5b1abd54dd0c7eee2a99bac158aebf21742fa868c8b087c11fa867ffc856e7e60bd4b91dd3a4180ad2d4b74f2a5de084e778542392081811d75339fd7440a23509d461b63a90e6bb7f2e593e847370e963c196d242e7250800000000000000ceac4b2a063914c42118ec952c0a2fc742383a7aad3a9a912ed24a69181a721854ce82369c7b4da8d59de6f9d79dd6d8601b36286bc715b3fc8dee7f0ded8ba67d77d29e139590e3fd9d0d4aa90e72ed39a45fd9b015321e42b4504c8b285312d9ff7d6a68973587477e31c377d872c50c52438adabc8498677ad053db396c1de0ba070aee69b8c9eff39be108338512c143afea863712b3a199152b5ef0e7813dce803ef4638b6d07374993e04e9314bd00c40551311caa744a04b0ba36b11500eb0ed20597573384cfdb51bd9714c7cd76bd4b32deeb64e4b80105ddf1a1a7eef919bf409ac9cc16404469a6e7e8ce8b6217bd85240fc2c2c26e2617aa200a',
    provingKey: PROVING_KEY,
  };
};
