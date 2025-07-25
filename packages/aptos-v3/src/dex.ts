import {
  AccountAddress,
  Aptos,
  InputEntryFunctionData,
  InputViewFunctionData,
  MoveResource,
  MoveValue,
} from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';
import { MAX_TICK, MaxUint64, MIN_TICK } from '@interest-protocol/v3-core';
import { pathOr } from 'ramda';
import invariant from 'tiny-invariant';

import {
  FEE_DENOMINATOR,
  FEE_TICK_SPACING,
  MAX_TICK_SPACING,
  MODULES,
  PACKAGES,
  STRUCT_TYPES,
} from './constants';
import {
  AddAdminArgs,
  AddFeeTickSpacingArgs,
  AddLiquidityFasArgs,
  AddRewardArgs,
  CollectFeesArgs,
  CollectProtocolFeeArgs,
  CollectRewardArgs,
  ConstructorArgs,
  DecreaseLiquidityFasArgs,
  GetTicksArgs,
  InitializeRewardArgs,
  InterestLpResource,
  NewLPAndAddLiquidityFasArgs,
  NewPoolAndLiquidityFasArgs,
  PendingFeesArgs,
  RemoveAdminArgs,
  SetProtocolFeeArgs,
  SwapFaArgs,
  UpdateEmissionsPerSecondArgs,
  UpdateEndTimestampArgs,
} from './dex.types';
import { CurrentTokenOwnershipsV2AggregateNode } from './gql.types';
import {
  formatInterestLpResource,
  getDefaultConstructorArgs,
  parseTicks,
} from './utils';

export class InterestV3 {
  client: Aptos;
  network: Network;
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
    fa0Metadata,
    fa1Metadata,
    amount0,
    amount1,
    fee,
    lowerTick,
    upperTick,
    rewards_tick_spacing_multiplier = 1,
    minFa0Amount = 0n,
    minFa1Amount = 0n,
    recipient,
  }: NewPoolAndLiquidityFasArgs): InputEntryFunctionData {
    this.#isValidAddress(fa0Metadata);
    this.#isValidAddress(fa1Metadata);
    this.#isValidAddress(recipient);

    this.#isValidTickRange(lowerTick, upperTick);

    invariant(amount0 > 0n, 'Amount 0 must be greater than 0');
    invariant(amount1 > 0n, 'Amount 1 must be greater than 0');
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
        fa0Metadata,
        amount0,
        fa1Metadata,
        amount1,
        fee,
        isPositiveLowerTick,
        lowerTickAbs,
        isPositiveUpperTick,
        upperTickAbs,
        rewards_tick_spacing_multiplier,
        minFa0Amount,
        minFa1Amount,
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
  }: SwapFaArgs): InputEntryFunctionData {
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

  newLpAndAddLiquidityFAs({
    pool,
    amount0,
    amount1,
    lowerTick,
    upperTick,
    minFa0Amount = 0n,
    minFa1Amount = 0n,
    recipient,
  }: NewLPAndAddLiquidityFasArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    this.#isValidAddress(recipient);

    this.#isValidTickRange(lowerTick, upperTick);

    invariant(amount0 > 0n, 'Amount 0 must be greater than 0');
    invariant(amount1 > 0n, 'Amount 1 must be greater than 0');

    const [isPositiveLowerTick, lowerTickAbs] = this.#numberToTuple(lowerTick);
    const [isPositiveUpperTick, upperTickAbs] = this.#numberToTuple(upperTick);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::new_lp_and_add_liquidity_fas`,
      functionArguments: [
        pool,
        amount0,
        amount1,
        isPositiveLowerTick,
        lowerTickAbs,
        isPositiveUpperTick,
        upperTickAbs,
        minFa0Amount,
        minFa1Amount,
        recipient,
      ],
    };
  }

  addLiquidityFas({
    interestLp,
    amount0,
    amount1,
    minFa0Amount = 0n,
    minFa1Amount = 0n,
    recipient,
  }: AddLiquidityFasArgs): InputEntryFunctionData {
    this.#isValidAddress(interestLp);
    this.#isValidAddress(recipient);

    invariant(
      amount0 > 0n || amount1 > 0n,
      'Amount 0 or amount 1 must be greater than 0'
    );

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::add_liquidity_fas`,
      functionArguments: [
        interestLp,
        amount0,
        amount1,
        minFa0Amount,
        minFa1Amount,
        recipient,
      ],
    };
  }

  decreaseLiquidityFas({
    interestLp,
    liquidity,
    minFa0Amount = 0n,
    minFa1Amount = 0n,
    recipient,
  }: DecreaseLiquidityFasArgs): InputEntryFunctionData {
    this.#isValidAddress(interestLp);
    this.#isValidAddress(recipient);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::decrease_liquidity`,
      functionArguments: [
        interestLp,
        liquidity,
        minFa0Amount,
        minFa1Amount,
        recipient,
      ],
    };
  }

  collectFees({
    interestLp,
    amount0Max = BigInt(MaxUint64.toString()),
    amount1Max = BigInt(MaxUint64.toString()),
    recipient,
  }: CollectFeesArgs): InputEntryFunctionData {
    this.#isValidAddress(interestLp);
    this.#isValidAddress(recipient);

    invariant(
      amount0Max > 0n || amount1Max > 0n,
      'Amount 0 max or amount 1 max must be greater than 0'
    );

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::collect_fees`,
      functionArguments: [interestLp, amount0Max, amount1Max, recipient],
    };
  }

  collectProtocolFee({
    pool,
    recipient,
  }: CollectProtocolFeeArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    this.#isValidAddress(recipient);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::collect_protocol_fees`,
      functionArguments: [
        pool,
        MaxUint64.toString(),
        MaxUint64.toString(),
        recipient,
      ],
    };
  }

  initializeReward({
    pool,
    amount,
    emissionsPerSecond,
    reward,
  }: InitializeRewardArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    invariant(amount > 0n, 'Amount must be greater than 0');
    invariant(
      emissionsPerSecond > 0,
      'Emissions per second must be greater than 0'
    );
    this.#isValidAddress(reward);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::initialize_reward`,
      functionArguments: [pool, reward, amount, emissionsPerSecond],
    };
  }

  addReward({ pool, reward, amount }: AddRewardArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    invariant(amount > 0n, 'Amount must be greater than 0');
    this.#isValidAddress(reward);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::add_reward`,
      functionArguments: [pool, reward, amount],
    };
  }

  updateEmissionsPerSecond({
    pool,
    reward,
    emissionsPerSecond,
  }: UpdateEmissionsPerSecondArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    this.#isValidAddress(reward);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::update_emissions_per_second`,
      functionArguments: [pool, reward, emissionsPerSecond],
    };
  }

  updateEndTimestamp({
    pool,
    reward,
    endTimestamp,
  }: UpdateEndTimestampArgs): InputEntryFunctionData {
    this.#isValidAddress(pool);
    this.#isValidAddress(reward);

    invariant(
      endTimestamp > new Date().getTime() / 1000,
      'End timestamp must be greater than 0'
    );

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::update_end_timestamp`,
      functionArguments: [pool, reward, Math.floor(endTimestamp)],
    };
  }

  collectReward({
    interestLp,
    reward,
    recipient,
  }: CollectRewardArgs): InputEntryFunctionData {
    this.#isValidAddress(interestLp);
    this.#isValidAddress(reward);
    this.#isValidAddress(recipient);

    return {
      function: `${this.#packages.INTERFACE.toString()}::${MODULES.INTERFACE.toString()}::collect_reward`,
      functionArguments: [interestLp, reward, recipient],
    };
  }

  async pendingFees({ pool, interestLp }: PendingFeesArgs) {
    this.#isValidAddress(pool);
    this.#isValidAddress(interestLp);

    const payload: InputViewFunctionData = {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.POOL.toString()}::pending_fees`,
      functionArguments: [pool, interestLp],
    };

    const data = await this.client.view({ payload });

    return {
      amount0: data[0] as string,
      amount1: data[1] as string,
    };
  }
  async filterLpByType(nodes: CurrentTokenOwnershipsV2AggregateNode[]) {
    const resources = await Promise.all(
      nodes.map((node) =>
        this.client.getAccountResources({
          accountAddress: node.current_token_data!.token_data_id,
        })
      )
    );

    const resourcesMap = resources.reduce(
      (acc, resource, index) => {
        acc[nodes[index]!.current_token_data!.token_data_id!] = resource;
        return acc;
      },
      {} as Record<string, MoveResource[]>
    );

    return nodes
      .filter((_, index) => {
        const x = resources[index]!;

        if (!x) return false;

        return x.some(
          (resource) => resource.type === STRUCT_TYPES[this.network].INTEREST_LP
        );
      })
      .map((data) => {
        const resources =
          resourcesMap[data.current_token_data!.token_data_id!]!;

        const y = resources.find(
          (resource) => resource.type === STRUCT_TYPES[this.network].INTEREST_LP
        )!;

        return {
          ...formatInterestLpResource(y!.data as InterestLpResource),
          tokenDataId: data.current_token_data!.token_data_id,
          collectionName:
            data.current_token_data.current_collection.collection_name,
          collectionId: data.current_token_data.collection_id,
          owner: data.owner_address,
        };
      });
  }

  async totalTicks(pool: string) {
    this.#isValidAddress(pool);

    const payload: InputViewFunctionData = {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.LENS.toString()}::total_ticks`,
      functionArguments: [pool],
    };

    const data = await this.client.view({ payload });

    return data[0] as number;
  }

  async headTick(pool: string) {
    this.#isValidAddress(pool);

    const payload: InputViewFunctionData = {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.LENS.toString()}::head_tick_key`,
      functionArguments: [pool],
    };

    const data = await this.client.view({ payload });

    const sign = data[0] as boolean;
    const number = data[1] as number;

    return sign ? number : -number;
  }
  async getTicks({ pool, firstTick, numberOfTicks }: GetTicksArgs) {
    this.#isValidAddress(pool);

    const [isPositiveFirstTick, firstTickAbs] = this.#numberToTuple(firstTick);

    const payload: InputViewFunctionData = {
      function: `${this.#packages.PROTOCOL.toString()}::${MODULES.LENS.toString()}::get_ticks`,
      functionArguments: [
        pool,
        isPositiveFirstTick,
        firstTickAbs,
        numberOfTicks,
      ],
    };

    const data = await this.client.view({ payload });

    const signOptional = pathOr([], ['vec'], data[1]);
    const valueOptional = pathOr([], ['vec'], data[2]);

    const sign =
      signOptional.length > 0 ? (signOptional[0] as unknown as boolean) : null;
    const value =
      valueOptional.length > 0 ? (valueOptional[0] as unknown as number) : null;

    return {
      ticks: parseTicks(data[0] as MoveValue[]),
      nextTick: sign === null || value === null ? null : sign ? value : -value,
    };
  }

  #numberToTuple(number: number): [boolean, number] {
    return [number >= 0, Math.abs(Math.floor(number))];
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
      'Input must be a valid Aptos address'
    );
  }
}
