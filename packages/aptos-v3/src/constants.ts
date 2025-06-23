import { AccountAddress } from '@aptos-labs/ts-sdk';
import { Network } from '@interest-protocol/movement-core-sdk';

export enum MODULES {
  CONFIG = 'interest_v3_config',
  POOL = 'interest_v3_pool',
  INTERFACE = 'v3_interface',
}

export const FEE_DENOMINATOR = 1_000_000;

export const MAX_TICK_SPACING = 16_384;

export enum Fees {
  VOLATILE = 2000,
}

export const FEE_TICK_SPACING = {
  [Fees.VOLATILE]: 60,
};

export const PACKAGES = {
  [Network.APTOS_TESTNET]: {
    DATA_STRUCTURES: AccountAddress.from(
      '0x7620421c699c50fc4145888e5ba36c13df1a86dda7165feeb3c157f8d147b686'
    ),
    MATH: AccountAddress.from(
      '0x613750dd62684b5b92e8d36a651bb237856b69a4a8a0bc9365985d04c060ac5d'
    ),
    PROTOCOL: AccountAddress.from(
      '0x2effd528db1ae8b0ff3c38a73f99393f6684a42ebbe5e9f8c89a3eca787f87cd'
    ),
    INTERFACE: AccountAddress.from(
      '0x4ff28ac1fa0eb13c15515f4b391ad3608391f5a98221531f57673f178b579bce'
    ),
    FAUCET: AccountAddress.from(
      '0x3a8440c5088d81637eb7f8769674d3ef9d95f8b88bc3fa2ee828c89c1f09eb6e'
    ),
  },
  [Network.BARDOCK]: {
    DATA_STRUCTURES: AccountAddress.from(
      '0x6bdd0cf9fdc22515cbf080468d6d707cfc7e59bd6e555d10d0cc5b9e40fd479f'
    ),
    MATH: AccountAddress.from(
      '0x217a8a66f30bc786877bf342532fc8e6ad98cc261344cb0de0b353a3270e57ab'
    ),
    PROTOCOL: AccountAddress.from(
      '0x2effd528db1ae8b0ff3c38a73f99393f6684a42ebbe5e9f8c89a3eca787f87cd'
    ),
    INTERFACE: AccountAddress.from(
      '0xd1e5c423a67a649bbb1c3029e5c4109e7faadd8807d8f3fcc4c65cb462eeeedd'
    ),
    FAUCET: AccountAddress.from(
      '0xbca9d3ae8081557fba52f90479bc1bf1b6d850d59b934e8916270bdd95de2914'
    ),
  },
  [Network.MAINNET]: {
    DATA_STRUCTURES: AccountAddress.from('0x0'),
    MATH: AccountAddress.from('0x0'),
    PROTOCOL: AccountAddress.from('0x0'),
    INTERFACE: AccountAddress.from('0x0'),
    FAUCET: AccountAddress.from('0x0'),
  },
};

export const TEST_FAS = {
  [Network.APTOS_TESTNET]: {
    BTC: AccountAddress.from(
      '0x397c1b0de29ce47b0f6a43f577248dfcc4b2ae11db8fdbaef3f8b9a5634933f4'
    ),
    WETH: AccountAddress.from(
      '0x21f12c6b789dc2cb04082e9a2de99cdda47ea10447c12a43c5ca209395d358d8'
    ),
    USDC: AccountAddress.from(
      '0x9b46c4742132205c1179622b0b676418cb86bc5720b47641d3c08ae25f8644f1'
    ),
  },
  [Network.BARDOCK]: {
    BTC: AccountAddress.from(
      '0x5b1eecef1577a45d8db0bea5f6a03173a87800c098adfcd3efe329e627a89323'
    ),
    WETH: AccountAddress.from(
      '0xe93efa8c945a4a7ba49b017d40ee5e406e768ecf6907d798896d8419bb0cf79a'
    ),
    USDC: AccountAddress.from(
      '0xe89bb4a170a8bf94afa759c4ca596462ec2ae9c6afbc10e9bf4263ebd061e8b2'
    ),
  },
  [Network.MAINNET]: {
    BTC: AccountAddress.from('0x0'),
    WETH: AccountAddress.from('0x0'),
    USDC: AccountAddress.from('0x0'),
  },
};
