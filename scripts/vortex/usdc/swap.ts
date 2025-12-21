import { getEnv } from '../utils.script';
import { USDC_PACKAGE_ID, TREASURY_SHARED_OBJECT } from './constants';
import { Transaction } from '@mysten/sui/transactions';
import {
  startSwap,
  finishSwap,
  VortexKeypair,
  getMerklePath,
  Utxo,
} from '@interest-protocol/vortex-sdk';
import { getUnspentUtxosAndMerkleTree } from '../events';
import { logSuccess } from '@interest-protocol/logger';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

(async () => {
  const {
    suiClient,
    keypair,
    vortexSdk,
    suiVortexPoolObjectId,
    testUSDCType,
    relayerKeypair,
    testUSDCPoolObjectId,
  } = await getEnv();

  const tx = new Transaction();

  const senderVortexKeypair = await VortexKeypair.fromSuiWallet(
    keypair.toSuiAddress(),
    (message) => keypair.signPersonalMessage(message)
  );

  // @dev Should come from the indexer
  const { unspentUtxos, merkleTree } = await getUnspentUtxosAndMerkleTree({
    suiClient,
    vortexSdk,
    suiVortexPoolObjectId,
    senderVortexKeypair,
  });

  const root = await merkleTree.root;

  const getMerklePathFn = async (utxo: Utxo | null) => ({
    path: getMerklePath(merkleTree, utxo),
    root: BigInt(root),
  });

  const {
    tx: startTx,
    coinIn: startCoinIn,
    receipt,
  } = await startSwap({
    tx,
    amount: 1_000_000_000n,
    vortexPool: suiVortexPoolObjectId,
    vortexKeypair: senderVortexKeypair,
    getMerklePathFn,
    unspentUtxos,
    vortexSdk,
    coinOutType: testUSDCType,
    relayer: relayerKeypair.toSuiAddress(),
    minAmountOut: 5_000_000n,
  });

  const usdcCoin = startTx.moveCall({
    target: `${USDC_PACKAGE_ID}::usdc::mint`,
    arguments: [
      startTx.object(TREASURY_SHARED_OBJECT),
      startTx.pure.u64(6_000_000n),
    ],
  });

  startTx.transferObjects([startCoinIn], relayerKeypair.toSuiAddress());

  // @dev Should come from the indexer
  const { unspentUtxos: finishUnspentUtxos, merkleTree: finishMerkleTree } =
    await getUnspentUtxosAndMerkleTree({
      suiClient,
      vortexSdk,
      suiVortexPoolObjectId: testUSDCPoolObjectId,
      senderVortexKeypair,
      coinType: testUSDCType,
    });

  const finishRoot = await finishMerkleTree.root;

  const finishGetMerklePathFn = async (utxo: Utxo | null) => ({
    path: getMerklePath(finishMerkleTree, utxo),
    root: BigInt(finishRoot),
  });

  const { tx: finishTx } = await finishSwap({
    tx: startTx,
    amount: 5_000_000n,
    vortexPool: testUSDCPoolObjectId,
    vortexKeypair: senderVortexKeypair,
    getMerklePathFn: finishGetMerklePathFn,
    unspentUtxos: finishUnspentUtxos,
    coinOut: usdcCoin,
    receipt,
    coinInType: SUI_TYPE_ARG,
    vortexSdk,
  });

  finishTx.setSender(relayerKeypair.toSuiAddress());

  const txBytes = await finishTx.build({
    client: suiClient,
  });

  // Rebuild in the server
  const rebuiltTransaction = await Transaction.from(txBytes);

  // Relayer deposits
  const result = await relayerKeypair.signAndExecuteTransaction({
    transaction: rebuiltTransaction,
    client: suiClient,
  });

  logSuccess('swap', result);
})();
