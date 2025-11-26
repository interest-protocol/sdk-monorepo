const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof navigator !== 'undefined';

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null &&
  typeof window === 'undefined';

export const getEnv = () => {
  if (isBrowser) return 'web';

  if (isNode) return 'node';

  throw new Error('Unsupported environment');
};
