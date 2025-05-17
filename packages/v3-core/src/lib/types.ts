export interface FromTickArgs {
  tick: number;
  baseToken: string;
  quoteToken: string;
  caller: string; // Address of the caller that must be authorized
}
