import { Aptos, Network as AptosNetwork } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

export interface ConstructorArgs {
  client?: Aptos;
  network?: Network | AptosNetwork.TESTNET;
}
