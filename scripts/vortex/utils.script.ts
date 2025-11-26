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
import { PROVING_KEY } from './proving-key';

export const VORTEX_PACKAGE_ID =
  '0xa032ea47415212df6637c6632916f6227249473c5a488cad71cd8b3207e34d89';

export const VORTEX_POOL_OBJECT_ID =
  '0xec02ac9b654cc0d25355b0c0a78131a5e8bbc58bf50de305b8ff419fc596d850';

export const REGISTRY_OBJECT_ID =
  '0x872322e485e58c5e327f60437daeb15f8fa9b84969869739121af2ebad0aa0eb';

export const INITIAL_SHARED_VERSION = '22';

const relayerKeypair = Ed25519Keypair.fromSecretKey(process.env.RELAYER_KEY!);
const recipientKeypair = Ed25519Keypair.fromSecretKey(
  process.env.RECIPIENT_KEY!
);

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
    vortex: vortexSDK,
    verifyingKey:
      '8abc1628853c25306d08b697c715ffab55a9ee43e8fb72cc4a3b6bb74407830c63dc8914a6aa2ef6be195b0b1589ac1ad05ad5ac0ce6e34829f7cb9610340519cbab341c90c5acd97085ba44f27ffa35cf527faa2da9da29019090555ad895895445aab414e17fab2cae2ccb341b42181b3aca24f715ff4501f517d97d14f70161dfe981a5101f528c5b1abd54dd0c7eee2a99bac158aebf21742fa868c8b087c11fa867ffc856e7e60bd4b91dd3a4180ad2d4b74f2a5de084e778542392081811d75339fd7440a23509d461b63a90e6bb7f2e593e847370e963c196d242e72508000000000000001d19ff5f73fa37f2b0b680b77a68f3e86d2d77ea9b8626d32f8f9edbd5e1eb8311da60ebfddb6af168326b9ad4530decc1334d0d69e266bca56534de60f3f60e8d0707e07f236ad397d07f764297aa1349483f0df3b839d91e136c4eac31d98b8647740a025d296c6e18233e6a2799885db8636d12d5e511db98b1ac4a75ca15c315ded2f66c999f9f1fd6946428cfa5721fd373e240a87dd3873199ce41d1974acf6df1a1e17b03e6cc48408190f78138e6fc47f75041f4b8854a0b7d266e83776e8200ba8ad2dd35426b2a3871c49809252056fd9f14a4cef60647565825151d828cd7ba054f7c270748b0df2313fa6a9c978ed6c7015cadad17c91617d598'.trim(),
    provingKey: PROVING_KEY,
  };
};
