import { poseidon2 } from 'poseidon-lite';
import { poseidon2 as poseidon2Vortex } from '@interest-protocol/vortex-sdk';
import invariant from 'tiny-invariant';

(async () => {
  const hash = poseidon2([1n, 2n]);
  const hashVortex = poseidon2Vortex(1n, 2n);

  console.log('hash', hash);
  console.log('hashVortex', hashVortex);
  invariant(hash === hashVortex, 'Hashes do not match');
})();
