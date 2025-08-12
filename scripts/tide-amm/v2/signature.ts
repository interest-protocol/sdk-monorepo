import { normalizeSuiAddress, SUI_TYPE_ARG } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import { USDC_TYPE } from '../utils.script';
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
    pool: normalizeSuiAddress('0x7'),
    coin_in: SUI_TYPE_ARG,
    coin_out: USDC_TYPE,
    amount_in: 2_000n,
    amount_out: 6_000n,
    deadline: 70n,
    gas_price: 123n,
    sender: keypair.toSuiAddress(),
    nonce: 0n,
  }).toBytes();

  logSuccess(toHex(await keypair.sign(quote)));

  logSuccess({
    publicKey: toHex(keypair.getPublicKey().toRawBytes()),
    suiAddress: keypair.toSuiAddress(),
  });
})();
