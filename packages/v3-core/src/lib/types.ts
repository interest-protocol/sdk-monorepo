import { Token } from '@/entities';

export interface FromTickArgs {
  tick: number;
  baseToken: Token;
  quoteToken: Token;
}
