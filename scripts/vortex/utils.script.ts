import { VortexKeypair, Utxo, Vortex } from '@interest-protocol/vortex-sdk';
import { Network } from '@interest-protocol/sui-core-sdk';
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
  '0xb6fdd9abdbfa4220efb69bf4b60c4b816e2acf622e78cc0df65abc572c4a860d';

export const UPGRADE_CAP =
  '0x1405fc93b03764f606af37ff8167ba2bc20b57e8a18e3a91e0b9b43094251993';

export const VORTEX_POOL_OBJECT_ID =
  '0x3e804f122325dc06af824d2ee234a41bb48d1db15193bd10ccaa1c54427a8224';

export const REGISTRY_OBJECT_ID =
  '0x1817dae0790a7f73af662a7898ffcd9db8de53d078a910e4d4c6e5504c06c2da';

export const INITIAL_SHARED_VERSION = '21';

export interface Env {
  VortexKeypair: typeof VortexKeypair;
  Utxo: typeof Utxo;
  suiClient: SuiClient;
  executeTx: (tx: Transaction, client?: SuiClient) => Promise<void>;
  network: Network;
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
  const network = Network.TESTNET;

  return {
    VortexKeypair,
    suiClient: devnetSuiClient,
    Utxo,
    executeTx,
    network,
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
      '8abc1628853c25306d08b697c715ffab55a9ee43e8fb72cc4a3b6bb74407830c63dc8914a6aa2ef6be195b0b1589ac1ad05ad5ac0ce6e34829f7cb9610340519cbab341c90c5acd97085ba44f27ffa35cf527faa2da9da29019090555ad895895445aab414e17fab2cae2ccb341b42181b3aca24f715ff4501f517d97d14f70161dfe981a5101f528c5b1abd54dd0c7eee2a99bac158aebf21742fa868c8b087c11fa867ffc856e7e60bd4b91dd3a4180ad2d4b74f2a5de084e778542392081811d75339fd7440a23509d461b63a90e6bb7f2e593e847370e963c196d242e72508000000000000007321810a9e3b2def63733a80b59ae78bc96dbdba4b8dcb66e33c4911b445d6a7bf22be21654be4ad8330e36760824d5f6e8d0874f45ad6ce2b8d6495967fef1e0ab17997e18d5413f9df18806bc0b4b41dd70aba3babdc7da2af0b7200e72802414b5c893610bf6d5877b8c82a01f8a8f2db0ec125027977d761c4138234178a4d0a43bb61295f8e3d07d9510f6a594f265d0a62a5fbe8328d5aa431cebcaba89a8bc8f0f2f7dd455906b3b9793fc6d8ebdb13ad2c8f6f6c8836e6144855d5a392573aebbe220531121e6aec38a82d4f48fb0bd39c44edd30549ccaa10e81d014741074b2a851ae5eb4129879f69330338f53e7a8e1e6316600b32d933e51b9a',
    provingKey: PROVING_KEY,
  };
};
