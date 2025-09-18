import { getEnv } from '../utils.script';
import { Pool } from '@interest-protocol/vortex-sdk';

const VERIFYING_KEY =
  'aed086b9a0a8f58a4ca6217c8976d844920f36eaae17cace9942115e32b86caa0fb68cb91c8d952f493449a95f68f3a2a23141cf6f8bfe553fd25097349ad52cdf4fb827b2d2540ce69c3e3f4ad3ea8f662b488dd1ba411e5843aa3f7c6f090781fa54f3db5ddd326e124b2ad194f524ecd8aea9d5737b946ee2fddc05b86d0f505c45a4735bccc22842b79965c1d904c4727528b7b0d47fbcaf52c22696b60340838d786199776c1728f0af067371e56ebe302fa9d3103dcd51948566746c1550765f252223251ffc7960bb3838cb59553b07b38eb133308d1896441727d9a703000000000000005ac2955226323c9541702fa728cac98ad4c99c6410d9f55a985b4a6d8c79e814893755dcaf8767cfb7c5da2d27c3c3cb51c54006e744d279fff62d0e477cdd0a41cb36ea6a6074ca10f8e734f5c7135fe66d38ba355b716fd0d19123405bb509';

(async () => {
  const { adminSdk, executeTx, pools } = await getEnv();

  const tx = adminSdk.setGroth16Vk({
    pool: pools[Pool.shrimp].objectId,
    vk: VERIFYING_KEY,
  });

  const tx2 = adminSdk.setGroth16Vk({
    pool: pools[Pool.whale].objectId,
    vk: VERIFYING_KEY,
    tx,
  });

  const tx3 = adminSdk.setGroth16Vk({
    pool: pools[Pool.dolphin].objectId,
    vk: VERIFYING_KEY,
    tx: tx2,
  });

  await executeTx(tx3);
})();
