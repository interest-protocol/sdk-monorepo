import { normalizeAddress } from '@/utils';

interface TokenConstructor {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
}

export class Token {
  public readonly address: string;
  public readonly decimals: number;
  public readonly symbol: string;
  public readonly name: string;

  constructor({ address, decimals, symbol, name }: TokenConstructor) {
    this.address = normalizeAddress(address);
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }

  public sortsBefore(other: Token): boolean {
    return this.address.toLowerCase() < other.address.toLowerCase();
  }
}
