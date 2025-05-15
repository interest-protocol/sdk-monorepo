export const hasValueOrThrow = <T>(
  value: T | undefined | null,
  msg: string = 'Value is undefined or null'
): T => {
  if (!value) {
    throw new Error(msg);
  }
  return value;
};
