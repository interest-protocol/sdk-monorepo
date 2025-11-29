import { poseidon4 as poseidon4Lite } from 'poseidon-lite';
import {
  poseidon1,
  poseidon2,
  poseidon3,
  poseidon4,
} from '@interest-protocol/vortex-sdk';

(async () => {
  console.log(poseidon1(1n));
  console.log(poseidon2(1n, 2n));
  console.log(poseidon3(1n, 2n, 3n));
  console.log(poseidon4(1n, 2n, 3n, 4n));
  console.log(poseidon4Lite([1n, 2n, 3n, 4n]));
})();
