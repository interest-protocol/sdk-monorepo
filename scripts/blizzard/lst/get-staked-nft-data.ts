import { logSuccess } from '@interest-protocol/sui-utils';

import { blizzardSDK } from '../utils.script';

(async () => {
  const stakeNFTData = await blizzardSDK.getStakeNFTData(
    '0x8ba285d394e097af0736eed5bc03ca718c5916d237ff11c7ccceb79c22f9adc4'
  );

  logSuccess(`Stake NFT data: ${stakeNFTData}`);
})();
