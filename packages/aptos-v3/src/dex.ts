import {
  AccountAddress,
  Aptos,
  InputEntryFunctionData,
} from '@aptos-labs/ts-sdk';
import { MAX_TICK, MIN_TICK } from '@interest-protocol/v3-core';
import invariant from 'tiny-invariant';

import {
  FEE_DENOMINATOR,
  FEE_TICK_SPACING,
  MAX_TICK_SPACING,
  MODULES,
  PACKAGES,
} from './constants';
import {
  AddAdminArgs,
  AddFeeTickSpacingArgs,
  ConstructorArgs,
  NewPoolAndLiquidityFAsArgs,
  RemoveAdminArgs,
  SetProtocolFeeArgs,
  SwapFAArgs,
} from './dex.types';
import { getDefaultConstructorArgs } from './utils';

export class InterestV3 {
  client: Aptos;
  network: ConstructorArgs['network'];
  #packages: (typeof PACKAGES)[keyof typeof PACKAGES];

  constructor(args?: ConstructorArgs | null | undefined) {
    const data = {
      ...getDefaultConstructorArgs(),
      ...args,
    };

    invariant(data.client, 'Client is required');
    invariant(data.network, 'Network is required');

    this.client = data.client;
    this.network = data.network;
    this.#packages = PACKAGES[data.network as keyof typeof PACKAGES];
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

  newPoolAndLiquidityFAs({
    faAMetadata,
    faBMetadata,
    amountA,
    amountB,
    fee,
    lowerTick,
    upperTick,
    rewards_tick_spacing_multiplier = 1,
    minFAAmount = 0n,
    minFBAmount = 0n,
    recipient,
  }: NewPoolAndLiquidityFAsArgs): InputEntryFunctionData {
    this.#isValidAddress(faAMetadata);
    this.#isValidAddress(faBMetadata);
    this.#isValidAddress(recipient);

    this.#isValidTickRange(lowerTick, upperTick);

    invariant(amountA > 0n, 'Amount A must be greater than 0');
    invariant(amountB > 0n, 'Amount B must be greater than 0');
    invariant(
      rewards_tick_spacing_multiplier > 0,
      'Rewards tick spacing multiplier must be greater than 0'
    );

    invariant(
      Object.keys(FEE_TICK_SPACING).includes(fee.toString()),
      'Fee must be a valid fee'
    );

    const [isPositiveLowerTick, lowerTickAbs] = this.#numberToTuple(lowerTick);
    const [isPositiveUpperTick, upperTickAbs] = this.#numberToTuple(upperTick);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::new_pool_and_add_liquidity_fas`,
      functionArguments: [
        faAMetadata,
        amountA,
        faBMetadata,
        amountB,
        fee,
        isPositiveLowerTick,
        lowerTickAbs,
        isPositiveUpperTick,
        upperTickAbs,
        rewards_tick_spacing_multiplier,
        minFAAmount,
        minFBAmount,
        recipient,
      ],
    };
  }

  swapFA({
    pool,
    faInMetadata,
    amountIn,
    sqrtPriceLimitX64 = 0n,
    minAmountOut = 0n,
    recipient,
  }: SwapFAArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    this.#isValidAddress(faInMetadata);
    this.#isValidAddress(recipient);

    invariant(amountIn > 0n, 'Amount in must be greater than 0');
    invariant(
      minAmountOut >= 0n,
      'Min amount out must be greater than or equal to 0'
    );

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::swap_fa`,
      functionArguments: [
        pool,
        faInMetadata,
        amountIn,
        sqrtPriceLimitX64,
        minAmountOut,
        recipient,
      ],
    };
  }

  #numberToTuple(number: number): [boolean, number] {
    return [number >= 0, Math.abs(number)];
  }

  #isValidTickRange(lowerTick: number, upperTick: number) {
    invariant(lowerTick < upperTick, 'Lower tick must be less than upper tick');

    invariant(
      lowerTick >= MIN_TICK,
      'Lower tick must be greater than or equal to MIN_TICK'
    );
    invariant(
      upperTick <= MAX_TICK,
      'Upper tick must be less than or equal to MAX_TICK'
    );
  }

  #isValidAddress(input: string) {
    invariant(
      AccountAddress.isValid({ input }),
      'Admin must be a valid Aptos address'
    );
  }
}
