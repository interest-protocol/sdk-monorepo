import { normalizeSuiAddress } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import { keypair } from '@interest-protocol/sui-utils';
import { logSuccess } from '@interest-protocol/logger';
import { toHex } from '@mysten/sui/utils';

const QuoteStruct = bcs.struct('Quote', {
  pool: bcs.Address,
  coin_in: bcs.string(),
  coin_out: bcs.string(),
  amount_in: bcs.u64(),
  amount_out: bcs.u64(),
  deadline: bcs.u64(),
  gas_price: bcs.u64(),
  sender: bcs.Address,
  nonce: bcs.u64(),
});

(async () => {
  const quote = QuoteStruct.serialize({
    pool: normalizeSuiAddress(
      '0xe355317e07b8352074f5ac22048abe6af5807f6a196bb7b5d42858570d0f6981'
    ),
    coin_in:
      '0000000000000000000000000000000000000000000000000000000000000000::weth::WETH',
    coin_out:
      '0000000000000000000000000000000000000000000000000000000000000000::usdc::USDC',
    amount_in: 2_000n,
    amount_out: 6_000n,
    deadline: 70n,
    gas_price: 123n,
    sender: keypair.toSuiAddress(),
    nonce: 1,
  }).toBytes();

  logSuccess(toHex(await keypair.sign(quote)));

  logSuccess({
    publicKey: toHex(keypair.getPublicKey().toRawBytes()),
    suiAddress: keypair.toSuiAddress(),
  });
})();
