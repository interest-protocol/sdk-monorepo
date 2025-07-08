import invariant from 'tiny-invariant';

export const returnIfDefinedOrThrow = <T>(
  value: T | undefined | null,
  msg: string = 'Value is undefined or null'
): T => {
  invariant(value, msg);
  return value;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
