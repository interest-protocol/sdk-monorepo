import { AccountAddress } from '@aptos-labs/ts-sdk';
import {
  FUNGIBLE_ASSETS_METADATA,
  Network,
  Package,
  WHITELISTED_FAS,
} from '@interest-protocol/movement-core-sdk';

export const PACKAGES = {
  [Network.MAINNET]: {
    name: 'interest_curve',
    address: AccountAddress.from(
      '0x373aab3f20ef3c31fc4caa287b0f18170f4a0b4a28c80f7ee79434458f70f241'
    ),
  },
  [Network.BARDOCK]: {
    name: 'interest_curve',
    address: AccountAddress.from(
      '0x373aab3f20ef3c31fc4caa287b0f18170f4a0b4a28c80f7ee79434458f70f241'
    ),
  },
  [Network.APTOS_TESTNET]: {
    name: 'interest_curve',
    address: AccountAddress.from(
      '0x373aab3f20ef3c31fc4caa287b0f18170f4a0b4a28c80f7ee79434458f70f241'
    ),
  },
} as Record<Network, Package>;

export const TYPES = {
  [Network.MAINNET]: {
    PAIRED_COIN_TYPE: '0x1::coin::PairedCoinType',
    CONCURRENT_SUPPLY: '0x1::fungible_asset::ConcurrentSupply',
    FA_METADATA: '0x1::fungible_asset::Metadata',
    OBJECT_CORE: '0x1::object::ObjectCore',
    COIN_STORE: '0x1::coin::CoinStore',
    FUNGIBLE_STORE: '0x1::fungible_asset::FungibleStore',
    INTEREST_POOL: `${PACKAGES[Network.MAINNET].address.toString()}::interest_curve_pool::InterestCurvePool`,
    VOLATILE_STATE: `${PACKAGES[Network.MAINNET].address.toString()}::volatile_pool::VolatileState`,
    STABLE_STATE: `${PACKAGES[Network.MAINNET].address.toString()}::stable_pool::StableState`,
  },
  [Network.BARDOCK]: {
    PAIRED_COIN_TYPE: '0x1::coin::PairedCoinType',
    CONCURRENT_SUPPLY: '0x1::fungible_asset::ConcurrentSupply',
    FA_METADATA: '0x1::fungible_asset::Metadata',
    OBJECT_CORE: '0x1::object::ObjectCore',
    COIN_STORE: '0x1::coin::CoinStore',
    FUNGIBLE_STORE: '0x1::fungible_asset::FungibleStore',
    INTEREST_POOL: `${PACKAGES[Network.BARDOCK].address.toString()}::interest_curve_pool::InterestCurvePool`,
    VOLATILE_STATE: `${PACKAGES[Network.BARDOCK].address.toString()}::volatile_pool::VolatileState`,
    STABLE_STATE: `${PACKAGES[Network.BARDOCK].address.toString()}::stable_pool::StableState`,
  },
  [Network.APTOS_TESTNET]: {
    PAIRED_COIN_TYPE: '0x1::coin::PairedCoinType',
    CONCURRENT_SUPPLY: '0x1::fungible_asset::ConcurrentSupply',
    FA_METADATA: '0x1::fungible_asset::Metadata',
    OBJECT_CORE: '0x1::object::ObjectCore',
    COIN_STORE: '0x1::coin::CoinStore',
    FUNGIBLE_STORE: '0x1::fungible_asset::FungibleStore',
    INTEREST_POOL: `${PACKAGES[Network.BARDOCK].address.toString()}::interest_curve_pool::InterestCurvePool`,
    VOLATILE_STATE: `${PACKAGES[Network.BARDOCK].address.toString()}::volatile_pool::VolatileState`,
    STABLE_STATE: `${PACKAGES[Network.BARDOCK].address.toString()}::stable_pool::StableState`,
  },
} as const;

export const DEFAULT_VOLATILE_POOL = {
  extendRef: '',
  isStable: false,
  address: '',
  supply: {
    maxValue: BigInt(0),
    value: BigInt(0),
  },
  adminFungibleStore: {
    type: '',
    address: '',
    balance: BigInt(0),
  },
  lpFaMetadata: {
    decimals: 0,
    iconURI: '',
    name: '',
    projectURI: '',
    symbol: '',
  },
  nFas: 0,
  fas: [],
  data: {
    a: '',
    futureA: '',
    futureGamma: '',
    futureTime: '',
    gamma: '',
    initialTime: '',
    virtualPrice: BigInt(0),
    xcpProfit: BigInt(0),
    xcpProfitA: BigInt(0),
    prices: {},
    fees: {
      midFee: BigInt(0),
      outFee: BigInt(0),
      gammaFee: BigInt(0),
      adminFee: BigInt(0),
    },
    futureFees: {
      midFee: BigInt(0),
      outFee: BigInt(0),
      gammaFee: BigInt(0),
      adminFee: BigInt(0),
    },
    lastPricesTimestamp: BigInt(0),
    maxA: BigInt(0),
    minA: BigInt(0),
    rebalancingParams: {
      extraProfit: BigInt(0),
      adjustmentStep: BigInt(0),
      maHalfTime: BigInt(0),
    },
    futureRebalancingParams: {
      extraProfit: BigInt(0),
      adjustmentStep: BigInt(0),
      maHalfTime: BigInt(0),
    },
    balances: [],
    d: BigInt(0),
  },
};

export const BLACKLISTED_POOLS = [
  // Stable USDCe/MOVE
  AccountAddress.from(
    '0xc4d03e70f504bcf04f21f975cf2eb94723fbe221d834a7a6b0bc72303281d7da'
  ),
  // Volatile Move/Test123
  AccountAddress.from(
    '0x486cc5aacea27797e8f47971ac5b0bc301d1aafd9b5510811360a7d28768ad39'
  ),
  // Volatile Move/Test
  AccountAddress.from(
    '0xdfa2be63f0a812001c537a9dd283b76bb31138846a9129bd39855979f04ab87b'
  ),
  // Volatile WETHe/MOVE (WRONG PRICE)
  AccountAddress.from(
    '0x89d75aae2a4cc65660bd28d989582a69a3c1579ed32d965d346f21e5bf191330'
  ),
];

export const WHITELISTED_CURVE_LP_COINS = {
  USDCe_USDTe_STABLE: AccountAddress.from(
    '0x54c89a961dd60e30f1c03ba2c6f5a052e7ed0ba36fcca3c1153f06449199b285'
  ),
  USDCe_MOVE_VOLATILE: AccountAddress.from(
    '0x691877d4f5d4c1177d02f6ca3d399df4624af265533d305c008f6cb15d1567bc'
  ),
  USDTe_MOVE_VOLATILE: AccountAddress.from(
    '0x12061cb8e5a17ae7d34dd3371479f7cec323e4ad16b8991792fb496d739e87af'
  ),
  USDCe_WETHe_VOLATILE: AccountAddress.from(
    '0x110a99c29036cf12de428f55c6c1e1838578e3db6d17a0b3b4e6d2e101d124f1'
  ),
  MOVE_WETHe_VOLATILE: AccountAddress.from(
    '0xc047546436145affa73b73df880d7b3a3c793e7155e0c6ad00a323ffc7e1d65a'
  ),
};

export const FUNGIBLE_ASSETS = {
  ...FUNGIBLE_ASSETS_METADATA,
  [WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE.toString()]: {
    symbol: 'USDCe-USDTe Stable',
    name: 'USDCe-USDTe Stable',
    address: WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE,
    iconUri: '',
    decimals: 9,
  },
  [WHITELISTED_CURVE_LP_COINS.USDCe_MOVE_VOLATILE.toString()]: {
    symbol: 'USDCe-MOVE Volatile',
    name: 'USDCe-MOVE Volatile',
    address: WHITELISTED_CURVE_LP_COINS.USDCe_MOVE_VOLATILE,
    iconUri: '',
    decimals: 9,
  },
  [WHITELISTED_CURVE_LP_COINS.USDTe_MOVE_VOLATILE.toString()]: {
    symbol: 'USDTe-MOVE Volatile',
    name: 'USDTe-MOVE Volatile',
    address: WHITELISTED_CURVE_LP_COINS.USDTe_MOVE_VOLATILE,
    iconUri: '',
    decimals: 9,
  },
  [WHITELISTED_CURVE_LP_COINS.USDCe_WETHe_VOLATILE.toString()]: {
    symbol: 'USDCe-WETHe Volatile',
    name: 'USDCe-WETHe Volatile',
    address: WHITELISTED_CURVE_LP_COINS.USDCe_WETHe_VOLATILE,
    iconUri: '',
    decimals: 9,
  },
  [WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString()]: {
    symbol: 'MOVE-WETHe Volatile',
    name: 'MOVE-WETHe Volatile',
    address: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE,
    iconUri: '',
    decimals: 9,
  },
};

export const MAINNET_POOLS = {
  [WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE.toString()]: {
    isStable: true,
    address: AccountAddress.from(
      '0x54c89a961dd60e30f1c03ba2c6f5a052e7ed0ba36fcca3c1153f06449199b285'
    ),
    name: 'USDCe-USDTe Stable',
    fas: [WHITELISTED_FAS.USDCe, WHITELISTED_FAS.USDTe],
  },
  [WHITELISTED_CURVE_LP_COINS.USDCe_MOVE_VOLATILE.toString()]: {
    isStable: false,
    address: AccountAddress.from(
      '0x691877d4f5d4c1177d02f6ca3d399df4624af265533d305c008f6cb15d1567bc'
    ),
    name: 'USDCe-MOVE Volatile',
    fas: [WHITELISTED_FAS.USDCe, WHITELISTED_FAS.MOVE],
  },
  [WHITELISTED_CURVE_LP_COINS.USDTe_MOVE_VOLATILE.toString()]: {
    isStable: false,
    address: AccountAddress.from(
      '0x12061cb8e5a17ae7d34dd3371479f7cec323e4ad16b8991792fb496d739e87af'
    ),
    name: 'USDTe-MOVE Volatile',
    fas: [WHITELISTED_FAS.USDTe, WHITELISTED_FAS.MOVE],
  },
  [WHITELISTED_CURVE_LP_COINS.USDCe_WETHe_VOLATILE.toString()]: {
    isStable: false,
    address: AccountAddress.from(
      '0x110a99c29036cf12de428f55c6c1e1838578e3db6d17a0b3b4e6d2e101d124f1'
    ),
    name: 'USDCe-WETHe Volatile',
    fas: [WHITELISTED_FAS.USDCe, WHITELISTED_FAS.WETHe],
  },
  [WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString()]: {
    isStable: false,
    address: AccountAddress.from(
      '0xc047546436145affa73b73df880d7b3a3c793e7155e0c6ad00a323ffc7e1d65a'
    ),
    name: 'MOVE-WETHe Volatile',
    fas: [WHITELISTED_FAS.MOVE, WHITELISTED_FAS.WETHe],
  },
};

export const FARMS = [
  {
    name: 'USDTe-MOVE FARM',
    address: AccountAddress.from(
      '0xcfa4ec9b2d1d343a57f67163ab564f5dbab44a52c864a9566d4b3d6f2c26cb7'
    ),
    stakeFa: WHITELISTED_CURVE_LP_COINS.USDTe_MOVE_VOLATILE.toString(),
    rewards: [WHITELISTED_FAS.MOVE.toString()],
  },
  {
    name: 'MOVE-WETHe FARM',
    address: AccountAddress.from(
      '0xa1a8f55a926213c971bb99dd9812c7cba10dae34d3222a5b466643b99e96a0fc'
    ),
    stakeFa: WHITELISTED_CURVE_LP_COINS.MOVE_WETHe_VOLATILE.toString(),
    rewards: [WHITELISTED_FAS.MOVE.toString()],
  },
  {
    name: 'USDCe-MOVE FARM',
    address: AccountAddress.from(
      '0xde6da5f201f66d9336574b75d87ac5dae938da6accab8dcd993f153d138cf749'
    ),
    stakeFa: WHITELISTED_CURVE_LP_COINS.USDCe_MOVE_VOLATILE.toString(),
    rewards: [WHITELISTED_FAS.MOVE.toString()],
  },
  {
    name: 'USDCe-USDTe Stable FARM',
    address: AccountAddress.from(
      '0x890a22a0bbdc83f7d2a9cd37d61d2d4261bd9296914fa007e5d47013f5fe3e76'
    ),
    stakeFa: WHITELISTED_CURVE_LP_COINS.USDCe_USDTe_STABLE.toString(),
    rewards: [WHITELISTED_FAS.MOVE.toString()],
  },
  {
    name: 'USDCe-WETHe Volatile FARM',
    address: AccountAddress.from(
      '0x67474006c35fdfbb2dbe312d1fb12ed68f15d945306d8aa7f9850f56ba336961'
    ),
    stakeFa: WHITELISTED_CURVE_LP_COINS.USDCe_WETHe_VOLATILE.toString(),
    rewards: [WHITELISTED_FAS.MOVE.toString()],
  },
];

export const BLACKLISTED_FARMS = [
  AccountAddress.from(
    '0xc7522bffe00b76d8a29d2a0290689868ca88d858c5923c725df23290500cc8c2'
  ),
  AccountAddress.from(
    '0xf54948ae917f101621ed02e813b0603f9c556f0041aa311d9e535c3b07a1ca6b'
  ),
];
