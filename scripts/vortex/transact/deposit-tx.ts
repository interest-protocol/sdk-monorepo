import { getEnv, Env } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  Utxo,
  Proof,
  reverseBytes,
  bytesToBigInt,
  toProveInput,
  Action,
} from '@interest-protocol/vortex-sdk';
import { fromHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { prove } from '../pkg/nodejs/vortex';

export const deposit = async ({
  VortexKeypair,
  keypair,
  vortex,
  provingKey,
}: Env) => {
  const vortexKeypair = await VortexKeypair.fromSuiWallet(
    keypair.toSuiAddress(),
    async (message) => keypair.signPersonalMessage(message)
  );
  const merkleTree = new MerkleTree(26);

  const nextIndex = await vortex.nextIndex();

  const inputUtxo0 = new Utxo({
    amount: 0n,
    index: BigInt(nextIndex),
    keypair: vortexKeypair,
  });

  const inputUtxo1 = new Utxo({
    amount: 0n,
    index: BigInt(nextIndex) + 1n,
    keypair: vortexKeypair,
  });

  // Output UTXOs: the actual deposit. Commitment Utxos do not need an index.
  const outputUtxo0 = new Utxo({
    amount: 500n,
    index: 0n,
    keypair: vortexKeypair,
  });

  const outputUtxo1 = new Utxo({
    amount: 0n,
    index: 0n,
    keypair: vortexKeypair,
  });

  const commitment0 = outputUtxo0.commitment();
  const commitment1 = outputUtxo1.commitment();

  const nullifier0 = inputUtxo0.nullifier();
  const nullifier1 = inputUtxo1.nullifier();

  const encryptedUtxo0 = VortexKeypair.encryptUtxoFor(
    outputUtxo0.payload(),
    vortexKeypair.encryptionKey
  );
  const encryptedUtxo1 = VortexKeypair.encryptUtxoFor(
    outputUtxo1.payload(),
    vortexKeypair.encryptionKey
  );

  // Deposit
  const publicAmount = 500n;

  const extDataHash = computeExtDataHash({
    recipient: keypair.toSuiAddress(),
    value: publicAmount,
    valueSign: true,
    relayer: '0x0',
    relayerFee: 0n,
    encryptedOutput0: fromHex(encryptedUtxo0),
    encryptedOutput1: fromHex(encryptedUtxo1),
  });

  const extDataHashBigInt = bytesToBigInt(reverseBytes(extDataHash));

  // Prepare circuit input
  const input = toProveInput({
    merkleTree,
    publicAmount,
    extDataHashBigInt,
    nullifier0,
    nullifier1,
    commitment0,
    commitment1,
    vortexKeypair,
    inputUtxo0,
    inputUtxo1,
    outputUtxo0,
    outputUtxo1,
  });

  const proof: Proof = JSON.parse(prove(JSON.stringify(input), provingKey));

  const publicInputs = {
    root: input.root,
    publicAmount: input.publicAmount,
    extDataHash: input.extDataHash,
    inputNullifier0: input.inputNullifier0,
    inputNullifier1: input.inputNullifier1,
    outputCommitment0: input.outputCommitment0,
    outputCommitment1: input.outputCommitment1,
  };

  return {
    proof,
    extDataHash,
    encryptedUtxo0,
    encryptedUtxo1,
    publicInputs,
  };
};

(async () => {
  try {
    const env = await getEnv();
    const { proof, encryptedUtxo0, encryptedUtxo1, publicInputs } =
      await deposit(env);

    const { keypair, vortex, suiClient } = env;

    const { extData, tx } = vortex.newExtData({
      recipient: keypair.toSuiAddress(),
      value: publicInputs.publicAmount,
      action: Action.Deposit,
      relayer: normalizeSuiAddress('0x0'),
      relayerFee: 0n,
      encryptedOutput0: fromHex(encryptedUtxo0),
      encryptedOutput1: fromHex(encryptedUtxo1),
    });

    tx.setSender(keypair.toSuiAddress());

    const { proof: moveProof, tx: tx2 } = vortex.newProof({
      tx,
      proofPoints: fromHex('0x' + proof.proofSerializedHex),
      root: publicInputs.root,
      publicValue: publicInputs.publicAmount,
      action: Action.Deposit,
      extDataHash: publicInputs.extDataHash,
      inputNullifier0: publicInputs.inputNullifier0,
      inputNullifier1: publicInputs.inputNullifier1,
      outputCommitment0: publicInputs.outputCommitment0,
      outputCommitment1: publicInputs.outputCommitment1,
    });

    const suiCoin = tx.splitCoins(tx.gas, [tx.pure.u64(500n)]);

    const { tx: tx3 } = vortex.transact({
      tx: tx2,
      proof: moveProof,
      extData: extData,
      deposit: suiCoin,
    });

    const result = await keypair.signAndExecuteTransaction({
      transaction: tx3,
      client: suiClient,
    });

    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
