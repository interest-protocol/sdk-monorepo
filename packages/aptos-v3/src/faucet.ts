import {
  AccountAddress,
  Aptos,
  InputEntryFunctionData,
  Network as AptosNetwork,
} from '@aptos-labs/ts-sdk';
import invariant from 'tiny-invariant';

import { PACKAGES } from './constants';
import {
  BurnArgs,
  ConstructorArgs,
  FaucetCreateArgs,
  FaucetMintArgs,
  FaucetMultiMintArgs,
} from './dex.types';
import { getDefaultConstructorArgs } from './utils';

export class Faucet {
  client: Aptos;
  network: ConstructorArgs['network'];
  faucet = PACKAGES.FAUCET;

  constructor(args?: ConstructorArgs | null | undefined) {
    const data = {
      ...getDefaultConstructorArgs(),
      ...args,
    };

    invariant(data.client, 'Client is required');
    invariant(data.network === AptosNetwork.TESTNET, 'Network is required');

    this.client = data.client;
    this.network = data.network;
  }

  create({
    name,
    symbol,
    decimals = 8,
  }: FaucetCreateArgs): InputEntryFunctionData {
    invariant(name, 'Name is required');
    invariant(symbol, 'Symbol is required');

    return {
      function: `${this.faucet.toString()}::faucet::create`,
      functionArguments: [name, symbol, decimals],
    };
  }

  mint(args: FaucetMintArgs): InputEntryFunctionData {
    const { metadata, amount, recipient } = args;

    invariant(
      AccountAddress.isValid({ input: metadata }),
      'Metadata is required'
    );
    invariant(amount > 0n, 'Amount is required');
    invariant(
      AccountAddress.isValid({ input: recipient }),
      'Recipient is required'
    );

    return {
      function: `${this.faucet.toString()}::faucet::mint`,
      functionArguments: [metadata, amount, recipient],
    };
  }

  multiMint({
    metadata,
    amounts,
    recipients,
  }: FaucetMultiMintArgs): InputEntryFunctionData {
    invariant(
      AccountAddress.isValid({ input: metadata }),
      'Metadata is required'
    );

    invariant(
      amounts.length === recipients.length,
      'Amounts and recipients must have the same length'
    );

    invariant(
      amounts.every((amount) => amount > 0n),
      'Amounts must be greater than 0'
    );

    return {
      function: `${this.faucet.toString()}::faucet::multi_mint`,
      functionArguments: [metadata, amounts, recipients],
    };
  }

  burn({ metadata, amount }: BurnArgs): InputEntryFunctionData {
    invariant(
      AccountAddress.isValid({ input: metadata }),
      'Metadata is required'
    );

    invariant(amount > 0n, 'Amount is required');

    return {
      function: `${this.faucet.toString()}::faucet::burn`,
      functionArguments: [metadata, amount],
    };
  }
}
