import { Aptos, Network as AptosNetwork } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

export interface ConstructorArgs {
  client?: Aptos;
  network?: Network | AptosNetwork.TESTNET;
}

export interface SetProtocolFeeArgs {
  fee: number;
}

export interface AddFeeTickSpacingArgs {
  fee: number;
  tickSpacing: number;
}

export interface AddAdminArgs {
  admin: string;
}

export interface RemoveAdminArgs {
  admin: string;
}

export interface FaucetCreateArgs {
  name: string;
  symbol: string;
  decimals?: number;
}

export interface FaucetMintArgs {
  metadata: string;
  amount: bigint;
  recipient: string;
}

export interface FaucetMultiMintArgs {
  metadata: string;
  amounts: bigint[];
  recipients: string[];
}
