import { testVortex } from './test-utils';
import { MERKLE_TREE_HEIGHT, EMPTY_SUBTREE_HASHES } from '../constants';

describe('Vortex', () => {
  it('should get the TVL', async () => {
    const tvl = await testVortex.tvl();
    expect(tvl).toBe(0n);
  });

  it('should get the root', async () => {
    const root = await testVortex.root();
    expect(root).toBe(String(EMPTY_SUBTREE_HASHES[MERKLE_TREE_HEIGHT]));
  });

  it('should get the next index', async () => {
    const nextIndex = await testVortex.nextIndex();
    expect(nextIndex).toBe('0');
  });

  it('should check if a nullifier is spent', async () => {
    const nullifier = 12345n;
    const isNullifierSpent = await testVortex.isNullifierSpent(nullifier);
    expect(isNullifierSpent).toBe(false);
  });
});
