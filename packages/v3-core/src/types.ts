import BigNumber from './lib/big-number';

export type Numberish = bigint | number | string | BigNumber;

export interface NearestUsableTickArgs {
  tick: number;
  tickSpacing: number;
}
