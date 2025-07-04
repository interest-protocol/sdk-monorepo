import {
  AccountAddress,
  Aptos,
  InputEntryFunctionData,
} from '@aptos-labs/ts-sdk';
import invariant from 'tiny-invariant';

import { PACKAGES } from './constants';
import {
  ConstructorArgs,
  FaucetCreateArgs,
  FaucetMintArgs,
  FaucetMultiMintArgs,
} from './dex.types';
import { getDefaultConstructorArgs } from './utils';

export class Faucet {
  client: Aptos;
  network: ConstructorArgs['network'];
  faucet: AccountAddress;

  constructor(args?: ConstructorArgs | null | undefined) {
    const data = {
      ...getDefaultConstructorArgs(),
      ...args,
    };

    invariant(data.client, 'Client is required');
    invariant(data.network, 'Network is required');

    this.client = data.client;
    this.network = data.network;
    this.faucet = PACKAGES[data.network].FAUCET;
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
      function: `${this.faucet.toString()}::faucet::mint_to`,
      functionArguments: [metadata, amounts, recipients],
    };
  }
}
