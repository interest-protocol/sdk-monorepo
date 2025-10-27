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

export {};
