import {
  AccountAddress,
  Aptos,
  InputEntryFunctionData,
} from '@aptos-labs/ts-sdk';
import invariant from 'tiny-invariant';

import {
  FEE_DENOMINATOR,
  MAX_TICK_SPACING,
  MODULES,
  PACKAGES,
} from './constants';
import {
  AddAdminArgs,
  AddFeeTickSpacingArgs,
  ConstructorArgs,
  RemoveAdminArgs,
  SetProtocolFeeArgs,
} from './dex.types';
import { getDefaultConstructorArgs } from './utils';

export class InterestV3 {
  client: Aptos;
  network: ConstructorArgs['network'];
  #packages = PACKAGES;

  constructor(args?: ConstructorArgs | null | undefined) {
    const data = {
      ...getDefaultConstructorArgs(),
      ...args,
    };

    invariant(data.client, 'Client is required');
    invariant(data.network, 'Network is required');

    this.client = data.client;
    this.network = data.network;
  }

  addAdmin(args: AddAdminArgs): InputEntryFunctionData {
    const { admin } = args;

    this.#isValidAddress(admin);

    return {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.CONFIG.toString()}::add_admin`,
      functionArguments: [admin],
    };
  }

  removeAdmin(args: RemoveAdminArgs): InputEntryFunctionData {
    const { admin } = args;

    this.#isValidAddress(admin);

    return {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.CONFIG.toString()}::remove_admin`,
      functionArguments: [admin],
    };
  }

  addFeeTickSpacing(args: AddFeeTickSpacingArgs): InputEntryFunctionData {
    const { fee, tickSpacing } = args;

    invariant(
      fee >= 0 && fee <= FEE_DENOMINATOR / 10,
      'Fee must be between 0 and 10%'
    );

    invariant(
      tickSpacing > 0 && tickSpacing <= MAX_TICK_SPACING,
      'Tick spacing must be between 0 and 16,384'
    );

    return {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.CONFIG.toString()}::add_fee_tick_spacing`,
      functionArguments: [fee, tickSpacing],
    };
  }

  setProtocolFee(args: SetProtocolFeeArgs): InputEntryFunctionData {
    const { fee } = args;

    invariant(
      fee >= 0 && fee <= FEE_DENOMINATOR / 2,
      'Fee must be between 0 and 50%'
    );

    return {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.CONFIG.toString()}::set_protocol_fee`,
      functionArguments: [fee],
    };
  }

  #isValidAddress(input: string) {
    invariant(
      AccountAddress.isValid({ input }),
      'Admin must be a valid Aptos address'
    );
  }
}
