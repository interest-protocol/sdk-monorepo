// global.d.ts
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      // Add any custom matchers you're using
    }
  }
}

declare module 'toformat' {
  import { Big } from 'big.js';
  import { Decimal } from 'decimal.js-light';

  interface Formatable {
    toFormat(decimalPlaces: number, format?: object): string;
  }

  const toFormat: <T extends typeof Decimal | typeof Big>(
    constructor: T
  ) => T & { new (...args: any[]): Formatable };
  export default toFormat;
}
