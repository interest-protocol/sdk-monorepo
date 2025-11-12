import {
  VortexEncryption,
  VortexKeypair,
  Utxo,
} from '@interest-protocol/vortex-sdk';
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

interface Env {
  vortexKeypair: VortexKeypair;
  Utxo: typeof Utxo;
  encryption: VortexEncryption;
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
}

export const getEnv = async (): Promise<Env> => {
  const network = Network.TESTNET;

  const vortexKeypair = VortexKeypair.generate();

  return {
    vortexKeypair,
    encryption: new VortexEncryption(vortexKeypair),
    suiClient: devnetSuiClient,
    Utxo,
    executeTx,
    network,
    keypair,
    POW_10_9: 10n ** 9n,
    devInspectTransactionBlock,
  } as any;
};
