import { AccountAddress } from '@aptos-labs/ts-sdk';

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
} as const;

export const TEST_FAS = {
  BTC: AccountAddress.from(
    '0x397c1b0de29ce47b0f6a43f577248dfcc4b2ae11db8fdbaef3f8b9a5634933f4'
  ),
  WETH: AccountAddress.from(
    '0x21f12c6b789dc2cb04082e9a2de99cdda47ea10447c12a43c5ca209395d358d8'
  ),
  USDC: AccountAddress.from(
    '0x9b46c4742132205c1179622b0b676418cb86bc5720b47641d3c08ae25f8644f1'
  ),
};
