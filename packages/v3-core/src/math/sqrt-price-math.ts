import { Q64 } from '@/constants';
import { BigNumber, BigNumberUtils } from '@/lib';

import {
  GetAmountDeltaArgs,
  GetNextSqrtPriceFromAmountArgs,
  GetNextSqrtPriceFromInputArgs,
} from './math.types';

export abstract class SqrtPriceMath {
  public static getNextSqrtPriceFromInput({
    sqrtPriceX64,
    liquidity,
    amountIn,
    zeroForOne,
  }: GetNextSqrtPriceFromInputArgs) {
    BigNumberUtils.assertNotZero(
      sqrtPriceX64,
      'sqrtPriceX64 must be greater than 0'
    );
    BigNumberUtils.assertNotZero(liquidity, 'liquidity must be greater than 0');

    if (zeroForOne) {
      return SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp({
        sqrtPriceX64,
        liquidity,
        amount: amountIn,
        add: true,
      });
    } else {
      return SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown({
        sqrtPriceX64,
        liquidity,
        amount: amountIn,
        add: true,
      });
    }
  }

  public static getNextSqrtPriceFromOutput({
    sqrtPriceX64,
    liquidity,
    amountIn,
    zeroForOne,
  }: GetNextSqrtPriceFromInputArgs) {
    BigNumberUtils.assertNotZero(
      sqrtPriceX64,
      'sqrtPriceX64 must be greater than 0'
    );
    BigNumberUtils.assertNotZero(liquidity, 'liquidity must be greater than 0');

    if (zeroForOne) {
      return SqrtPriceMath.getNextSqrtPriceFromAmount1RoundingDown({
        sqrtPriceX64,
        liquidity,
        amount: amountIn,
        add: false,
      });
    } else {
      return SqrtPriceMath.getNextSqrtPriceFromAmount0RoundingUp({
        sqrtPriceX64,
        liquidity,
        amount: amountIn,
        add: false,
      });
    }
  }

  public static getAmount0Delta({
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
    roundUp,
  }: GetAmountDeltaArgs) {
    [sqrtPriceAX64, sqrtPriceBX64] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    const numerator1 = BigNumberUtils.shiftLeft(liquidity, 64);
    const numerator2 = sqrtPriceBX64.minus(sqrtPriceAX64);

    BigNumberUtils.assertNotZero(
      sqrtPriceAX64,
      'sqrtPriceAX64 must be greater than 0'
    );

    if (roundUp) {
      return BigNumberUtils.divUp(
        BigNumberUtils.divUp(
          numerator1.multipliedBy(numerator2),
          sqrtPriceBX64
        ),
        sqrtPriceAX64
      );
    } else {
      return numerator1
        .multipliedBy(numerator2)
        .dividedBy(sqrtPriceBX64)
        .dividedBy(sqrtPriceAX64);
    }
  }

  public static getAmount1Delta({
    sqrtPriceAX64,
    sqrtPriceBX64,
    liquidity,
    roundUp,
  }: GetAmountDeltaArgs) {
    [sqrtPriceAX64, sqrtPriceBX64] = BigNumberUtils.sort(
      sqrtPriceAX64,
      sqrtPriceBX64
    );

    if (roundUp) {
      return BigNumberUtils.divUp(
        new BigNumber(liquidity).multipliedBy(
          sqrtPriceBX64.minus(sqrtPriceAX64)
        ),
        Q64
      );
    } else {
      return new BigNumber(liquidity)
        .multipliedBy(sqrtPriceBX64.minus(sqrtPriceAX64))
        .dividedBy(Q64);
    }
  }

  private static getNextSqrtPriceFromAmount0RoundingUp({
    sqrtPriceX64,
    liquidity,
    amount,
    add,
  }: GetNextSqrtPriceFromAmountArgs) {
    if (new BigNumber(amount).isZero()) return new BigNumber(sqrtPriceX64);

    const numerator1 = BigNumberUtils.shiftLeft(liquidity, 64);
    const [success, product] = BigNumberUtils.tryMul(amount, sqrtPriceX64);

    if (add) {
      if (success) {
        const denominator = BigNumberUtils.wrappingAdd(product, numerator1);

        if (denominator.gte(numerator1)) {
          return BigNumberUtils.divUp(
            numerator1.multipliedBy(sqrtPriceX64),
            denominator
          );
        }

        return BigNumberUtils.divUp(
          numerator1,
          numerator1.dividedBy(sqrtPriceX64).plus(new BigNumber(amount))
        );
      } else {
        const denominator = numerator1.minus(product);

        return BigNumberUtils.divUp(
          numerator1.multipliedBy(sqrtPriceX64),
          denominator
        );
      }
    }
  }

  private static getNextSqrtPriceFromAmount1RoundingDown({
    sqrtPriceX64,
    liquidity,
    amount,
    add,
  }: GetNextSqrtPriceFromAmountArgs) {
    if (add) {
      return new BigNumber(sqrtPriceX64).plus(
        BigNumberUtils.shiftLeft(amount, 64).dividedBy(liquidity)
      );
    } else {
      const quotient = BigNumberUtils.divUp(
        BigNumberUtils.shiftLeft(amount, 64),
        liquidity
      );
      return new BigNumber(sqrtPriceX64).minus(quotient);
    }
  }
}
