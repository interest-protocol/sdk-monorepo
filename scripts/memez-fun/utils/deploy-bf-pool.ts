import { BLUEFIN_CONFIG } from '@interest-protocol/memez-fun-sdk';
import { suiClient } from '@interest-protocol/sui-utils';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';

import { getEnv } from '../utils.script';

const BLUEFIN_HELPER_PACKAGE =
  '0x6f79f1d93c67de14f8efd8a1954e10077e15c2522fcbcf2fe4021214c8ade0fe';

const MEME_COIN_A_TYPE =
  '0x55efdcd8a868d728abd5845c9adfdccf84ce4917ea7da92ffd75717920e41da1::test::TEST';
const MEME_COIN_B_TYPE =
  '0x55efdcd8a868d728abd5845c9adfdccf84ce4917ea7da92ffd75717920e41da1::test::TEST';

(async () => {
  const { executeTx, network, pumpSdk, testnetPoolId } = await getEnv();
})();
