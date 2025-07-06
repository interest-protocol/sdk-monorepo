import { AccountAddress, Aptos } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

interface NewVolatilePoolArgs {
  a?: bigint;
  gamma?: bigint;
  extraProfit?: bigint;
  adjustmentStep?: bigint;
  maHalfTime?: bigint;
  midFee?: bigint;
  outFee?: bigint;
  gammaFee?: bigint;
  prices: bigint[];
}

export interface AssertNewVolatilePoolArgs {
  a: bigint;
  gamma: bigint;
  extraProfit: bigint;
  adjustmentStep: bigint;
  maHalfTime: bigint;
  midFee: bigint;
  outFee: bigint;
  gammaFee: bigint;
  prices: bigint[];
  assets: string[];
}

export interface ConstructorArgs {
  client?: Aptos;
  network?: Network;
}

export interface NewStablePoolWithFasArgs {
  metadatas: string[];
  initialA?: bigint;
}

export interface NewStablePoolWithCoinsArgs {
  initialA?: bigint;
  coinTypes: string[];
}

export interface NewVolatilePoolWithCoinsArgs extends NewVolatilePoolArgs {
  coinTypes: string[];
}

export interface NewVolatilePoolWithFasArgs extends NewVolatilePoolArgs {
  fas: string[];
}

export interface GetFaPrimaryStoreArgs {
  owner: string;
  fa: string;
}

export interface SwapArgs {
  pool: string;
  faIn: string;
  faOut: string;
  amountIn: bigint;
  minAmountOut: bigint;
  recipient: string;
}

export interface SwapCoinToFaArgs {
  pool: string;
  coinIn: string;
  faOut: string;
  amountIn: bigint;
  minAmountOut: bigint;
  recipient: string;
}

export interface SwapFaToCoinArgs {
  pool: string;
  faIn: string;
  coinOut: string;
  amountIn: bigint;
  minAmountOut: bigint;
  recipient: string;
}

export interface AddLiquidityArgs {
  pool: string;
  fasIn: string[];
  amounts: bigint[];
  recipient: string;
  minAmountOut: bigint;
}

export interface RemoveLiquidityArgs {
  pool: string;
  amount: bigint;
  minAmountsOut: bigint[];
  recipient: string;
}

export interface RemoveLiquidityOneFaArgs {
  pool: string;
  faOut: string;
  amount: bigint;
  minAmountOut: bigint;
  recipient: string;
}

export interface StakeArgs {
  farm: string;
  amount: bigint;
  faIn: string;
}

export interface StakeCoinArgs {
  farm: string;
  coinType: string;
  amount: bigint;
}

export interface UnstakeArgs {
  farm: string;
  amount: bigint;
  recipient: string;
}

export interface HarvestArgs {
  farm: string;
  rewardFa: string;
  recipient: string;
}

export interface HarvestAllArgs {
  farms: string[];
  rewardFas: string[];
  recipient: string;
}

export interface QuoteSwapArgs {
  pool: string;
  faIn: string;
  faOut: string;
  amountIn: bigint;
}

export interface QuoteSwapCoinToFaArgs {
  pool: string;
  coinIn: string;
  faOut: string;
  amountIn: bigint;
}

export interface QuoteSwapFaToCoinArgs {
  pool: string;
  faIn: string;
  coinOut: string;
  amountIn: bigint;
}

export interface QuoteSwapCoinToCoinArgs {
  pool: string;
  coinIn: string;
  coinOut: string;
  amountIn: bigint;
}

export interface QuoteAddLiquidityArgs {
  pool: string;
  amountsIn: bigint[];
}

export interface QuoteRemoveLiquidityArgs {
  pool: string;
  amountIn: bigint;
}

export interface QuoteRemoveLiquidityOneFaArgs {
  pool: string;
  faOut: string;
  amountIn: bigint;
}

export interface QuoteRemoveLiquidityOneCoinArgs {
  pool: string;
  coinOut: string;
  amountIn: bigint;
}

export interface GetPoolAddressArgs {
  fas: string[];
  isStable: boolean;
}

export interface FaSupply {
  maxValue: bigint;
  value: bigint;
}

export interface FaMetadata {
  decimals: number;
  iconURI: string;
  name: string;
  projectURI: string;
  symbol: string;
}

export interface FaPayload {
  pairedCoinType: string | null;
  metadata: FaMetadata;
  address: AccountAddress;
  supply: FaSupply;
  allowsUngatedTransfer: boolean;
  owner: AccountAddress;
}

export interface WhitelistedFaMetadata {
  symbol: string;
  name: string;
  address: AccountAddress;
  iconUri: string;
  decimals: number;
}

export interface CoinBalance {
  type: string;
  balance: bigint;
}

export interface RawVolatilePrice {
  key: string;
  value: {
    address: string;
    index: string;
    last_price: string;
    price: string;
    price_oracle: string;
  };
}

export interface FungibleStore {
  type: string;
  address: string;
  balance: bigint;
}

export interface VolatilePool {
  a: string;
  futureA: string;
  futureGamma: string;
  futureTime: string;
  gamma: string;
  initialTime: string;
  virtualPrice: bigint;
  xcpProfit: bigint;
  xcpProfitA: bigint;
  prices: Record<string, VolatilePrice>;
  fees: VolatileFees;
  futureFees: VolatileFees;
  lastPricesTimestamp: bigint;
  maxA: bigint;
  minA: bigint;
  rebalancingParams: RebalancingParams;
  futureRebalancingParams: RebalancingParams;
  d: bigint;
  balances: ReadonlyArray<bigint>;
}

export interface StablePool {
  balances: ReadonlyArray<bigint>;
  initialA: bigint;
  futureA: bigint;
  initialATime: bigint;
  futureATime: bigint;
  adminFee: bigint;
  fee: bigint;
  futureFee: null | bigint;
  futureAdminFee: null | bigint;
  a: bigint;
}

export interface VolatilePrice {
  lastPrice: bigint;
  price: bigint;
  priceOracle: bigint;
}

export interface VolatileFees {
  adminFee: bigint;
  gammaFee: bigint;
  midFee: bigint;
  outFee: bigint;
}

export interface RebalancingParams {
  extraProfit: bigint;
  adjustmentStep: bigint;
  maHalfTime: bigint;
}

export interface InterestCurvePool {
  extendRef: string;
  isStable: boolean;
  address: string;
  supply: FaSupply;
  adminFungibleStore: FungibleStore;
  lpFaMetadata: FaMetadata;
  nFas: number;
  fas: ReadonlyArray<string>;
  data: VolatilePool | StablePool;
}

export interface GetPoolPageArgs {
  start: number;
  pageSize: number;
}

// ===  FARM START ===

export interface Reward {
  rewardFa: WhitelistedFaMetadata;
  balance: bigint;
  rewardsPerSecond: bigint;
}

export interface Farm {
  address: string;
  stakedBalance: bigint;
  startTimestamp: bigint;
  stakedFa: WhitelistedFaMetadata;
  rewards: Reward[];
}

export interface NewFarmArgs {
  startTimestamp: number;
  rewardFas: string[];
  stakedFa: string;
}

export interface SetRewardsPerSecondArgs {
  farm: string;
  rewardFa: string;
  rewardsPerSecond: bigint;
}

export interface AddRewardFaArgs {
  farm: string;
  rewardFa: string;
  amount: bigint;
}

export interface GetFarmAccountArgs {
  user: string;
  farm: string;
  rewardFas: string[];
}

export interface GetAccountFarmsDataArgs {
  user: string;
  farms: string[];
  rewardFas: string[];
}

// ===  FARM END ===

// ===  LP FA METADATA START ===

export interface SetLpFaMetadataArgs {
  pool: string;
  name: string;
  symbol: string;
  iconUri: string;
  projectUri: string;
}

// ===  LP FA METADATA END ===

// === Utilities Start ===

export interface WrapCoinsArgs {
  coinTypes: string[];
  amounts: bigint[];
  recipient: string;
}
