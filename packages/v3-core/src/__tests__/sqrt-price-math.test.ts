import { MaxUint256 } from '@/constants';
import { SqrtPriceMath } from '@/math';

const POW_10_9 = 10n ** 9n;

describe(SqrtPriceMath.name, () => {
  describe(SqrtPriceMath.getNextSqrtPriceFromInput.name, () => {
    it('throws if the price is 0', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 0n,
          liquidity: 1000000000000000000n,
          amountIn: 1000000000000000000n,
          zeroForOne: true,
        })
      ).toThrow('sqrtPriceX64 must be greater than 0');
    });

    it('throws if the liquidity is 0', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 1000000000000000000n,
          liquidity: 0n,
          amountIn: 1000000000000000000n,
          zeroForOne: true,
        })
      ).toThrow('liquidity must be greater than 0');
    });

    it('does not throw regardless of the amount', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 1n,
          liquidity: 1n,
          amountIn: MaxUint256,
          zeroForOne: true,
        })
      ).toBe(1n);
    });

    it('returns the input price if the amount is zero and zeroForOne is true', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 0x10000000000000000n,
          liquidity: POW_10_9 / 10n,
          amountIn: 0,
          zeroForOne: true,
        })
      ).toBe(0x10000000000000000n);
    });

    it('returns the input price if the amount is zero and zeroForOne is false', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 0x01000000000000000000000000n,
          liquidity: POW_10_9 / 10n,
          amountIn: 0,
          zeroForOne: false,
        })
      ).toBe(0x01000000000000000000000000n);
    });

    it('input amount of 0.1 token1', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 18446744073709551616n,
          liquidity: POW_10_9,
          amountIn: POW_10_9 / 10n,
          zeroForOne: false,
        })
      ).toBe(20291418481080506777n);
    });

    it('input amount of 0.1 token0', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromInput({
          sqrtPriceX64: 18446744073709551616n,
          liquidity: POW_10_9,
          amountIn: POW_10_9 / 10n,
          zeroForOne: true,
        })
      ).toBe(16769767339735956015n);
    });
  });

  describe(SqrtPriceMath.getNextSqrtPriceFromOutput.name, () => {
    it('throws if the price is 0', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 0n,
          liquidity: 1000000000000000000n,
          amountIn: 1000000000000000000n,
          zeroForOne: true,
        })
      ).toThrow('sqrtPriceX64 must be greater than 0');
    });

    it('throws if the liquidity is 0', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 1000000000000000000n,
          liquidity: 0n,
          amountIn: 1000000000000000000n,
          zeroForOne: true,
        })
      ).toThrow('liquidity must be greater than 0');
    });

    it('throws if the output amount is exactly the virtual reserves of token0', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 4722366482869645213696n,
          liquidity: 1024n,
          amountIn: 4n,
          zeroForOne: false,
        })
      ).toThrow('sqrtPriceX64: not enough liquidity');
    });

    it('throws if the output amount is greater than the virtual reserves of token0', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 4722366482869645213696n,
          liquidity: 1024n,
          amountIn: 5n,
          zeroForOne: false,
        })
      ).toThrow('sqrtPriceX64: not enough liquidity');
    });

    it('throws if the output amount is greater than the virtual reserves of token1', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 4722366482869645213696n,
          liquidity: 1024n,
          amountIn: 262145n,
          zeroForOne: true,
        })
      ).toThrow('sqrtPriceX64: not enough liquidity');
    });

    it('throws if the output amount is exactly the virtual reserves of token1', () => {
      expect(() =>
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 4722366482869645213696n,
          liquidity: 1024n,
          amountIn: 262144n,
          zeroForOne: true,
        })
      ).toThrow('sqrtPriceX64: not enough liquidity');
    });

    it('succeeds if output amount is just less than the virtual reserves of token', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 4722366482869645213696n,
          liquidity: 1024n,
          amountIn: 262144n - 1n,
          zeroForOne: true,
        })
      ).toBe(18014398509481984n);
    });

    it('returns input price if amount in is zero and zeroForOne = true', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 18446744073709551616n,
          liquidity: POW_10_9 / 10n,
          amountIn: 0n,
          zeroForOne: true,
        })
      ).toBe(18446744073709551616n);
    });

    it('returns input price if amount in is zero and zeroForOne = false', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 18446744073709551616n,
          liquidity: POW_10_9 / 10n,
          amountIn: 0n,
          zeroForOne: false,
        })
      ).toBe(18446744073709551616n);
    });

    it('returns input price if amount in 1/10 token0 and zeroForOne = false', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 18446744073709551616n,
          liquidity: POW_10_9,
          amountIn: POW_10_9 / 10n,
          zeroForOne: false,
        })
      ).toBe(20496382304121724018n);
    });

    it('returns input price if amount in 1/10 token1 and zeroForOne = true', () => {
      expect(
        SqrtPriceMath.getNextSqrtPriceFromOutput({
          sqrtPriceX64: 18446744073709551616n,
          liquidity: POW_10_9,
          amountIn: POW_10_9 / 10n,
          zeroForOne: true,
        })
      ).toBe(16602069666338596454n);
    });
  });

  describe(SqrtPriceMath.getAmount0Delta.name, () => {
    it('returns 0 if liquidity is 0', () => {
      expect(
        SqrtPriceMath.getAmount0Delta({
          sqrtPriceAX64: 18446744073709551616n,
          sqrtPriceBX64: 260876356506655644246n,
          liquidity: 0n,
          roundUp: true,
        })
      ).toBe(0n);
    });

    it('returns 0 if prices are equal', () => {
      expect(
        SqrtPriceMath.getAmount0Delta({
          sqrtPriceAX64: 79228162514264337593543950336n,
          sqrtPriceBX64: 79228162514264337593543950336n,
          liquidity: 1n,
          roundUp: true,
        })
      ).toBe(0n);
    });

    it('returns 0.1 amount1 for price of 1 to 1.21', () => {
      expect(
        SqrtPriceMath.getAmount0Delta({
          sqrtPriceAX64: 18446744073709551616n,
          sqrtPriceBX64: 20291418481080506777n,
          liquidity: POW_10_9,
          roundUp: true,
        })
      ).toBe(90909091n);
    });

    it('returns 0.1 amount0 for price of 1 to 1.21', () => {
      expect(
        SqrtPriceMath.getAmount0Delta({
          sqrtPriceAX64: 18446744073709551616n,
          sqrtPriceBX64: 20291418481080506777n,
          liquidity: POW_10_9,
          roundUp: false,
        })
      ).toBe(90909091n - 1n);
    });

    it('works for prices that overflow', () => {
      const amount0Up = SqrtPriceMath.getAmount0Delta({
        sqrtPriceAX64: 79228162514264337593543950336n,
        sqrtPriceBX64: 87150978765690771352898345369n,
        liquidity: 1000000000000000000n,
        roundUp: true,
      });

      const amount0Down = SqrtPriceMath.getAmount0Delta({
        sqrtPriceAX64: 79228162514264337593543950336n,
        sqrtPriceBX64: 87150978765690771352898345369n,
        liquidity: 1000000000000000000n,
        roundUp: false,
      });

      expect(amount0Up).toBe(amount0Down + 1n);
    });
  });

  describe(SqrtPriceMath.getAmount1Delta.name, () => {
    it('returns 0 if liquidity is 0', () => {
      expect(
        SqrtPriceMath.getAmount1Delta({
          sqrtPriceAX64: 18446744073709551616n,
          sqrtPriceBX64: 26087635650665564424n,
          liquidity: 0n,
          roundUp: true,
        })
      ).toBe(0n);
    });

    it('returns 0 if prices are equal', () => {
      expect(
        SqrtPriceMath.getAmount1Delta({
          sqrtPriceAX64: 18446744073709551616n,
          sqrtPriceBX64: 18446744073709551616n,
          liquidity: 1n,
          roundUp: true,
        })
      ).toBe(0n);
    });

    it('returns 0.1 amount1 for price of 1 to 1.21', () => {
      const amount1 = SqrtPriceMath.getAmount1Delta({
        sqrtPriceAX64: 18446744073709551616n,
        sqrtPriceBX64: 20291418481080506777n,
        liquidity: POW_10_9,
        roundUp: true,
      });

      expect(amount1).toBe(100000000n);

      const amount1RoundingDown = SqrtPriceMath.getAmount1Delta({
        sqrtPriceAX64: 18446744073709551616n,
        sqrtPriceBX64: 20291418481080506777n,
        liquidity: POW_10_9,
        roundUp: false,
      });

      expect(amount1RoundingDown).toBe(amount1 - 1n);
    });
  });

  it('swap computations', () => {
    const sqrtPriceBX64 = 20291418481080506777n;
    const liquidity = 110n;
    const amountIn = 50n;
    const zeroForOne = true;

    const sqrtPriceAX64 = SqrtPriceMath.getNextSqrtPriceFromInput({
      sqrtPriceX64: sqrtPriceBX64,
      liquidity,
      amountIn,
      zeroForOne,
    });

    expect(sqrtPriceAX64).toBe(13527612320720337852n);

    const amount0Delta = SqrtPriceMath.getAmount0Delta({
      sqrtPriceAX64,
      sqrtPriceBX64,
      liquidity,
      roundUp: true,
    });

    expect(amount0Delta).toBe(amountIn);
  });
});
