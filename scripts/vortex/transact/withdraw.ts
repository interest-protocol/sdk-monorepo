import { getEnv, Env } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  Utxo,
  reverseBytes,
  bytesToBigInt,
  Proof,
  parseNewCommitmentEvent,
  UtxoPayload,
  BN254_FIELD_MODULUS,
} from '@interest-protocol/vortex-sdk';
import { logInfo } from '@interest-protocol/logger';
import { fromHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { prove } from '../pkg/nodejs/vortex';

import { Transaction } from '@mysten/sui/transactions';
import { BN } from 'bn.js';

export const withdraw = async ({
  VortexKeypair,
  keypair,
  vortex,
  provingKey,
  getMerklePath,
  suiClient,
  recipientKeypair,
}: Env) => {
  const vortexKeypair = await VortexKeypair.fromSuiWallet(
    keypair.toSuiAddress(),
    async (message) => keypair.signPersonalMessage(message)
  );

  const commitmentEvents = await suiClient.queryEvents({
    query: {
      MoveEventType: vortex.newCommitmentEventType,
    },
  });

  const parsedCommitmentEvents = parseNewCommitmentEvent(commitmentEvents).sort(
    (a, b) => Number(a.index) - Number(b.index)
  );

  const utxos = [] as UtxoPayload[];

  parsedCommitmentEvents.forEach((event) => {
    try {
      const utxo = vortexKeypair.decryptUtxo(event.encryptedOutput);
      utxos.push({ ...utxo, index: event.index });
    } catch (error) {
      console.log('Not our UTXO');
    }
  });

  logInfo('utxos', utxos);

  const merkleTree = new MerkleTree(26);

  console.log('root', merkleTree.root());
  console.log('root from chain', await vortex.root());

  merkleTree.bulkInsert(
    parsedCommitmentEvents.map((event) => event.commitment)
  );

  // Consuming 500
  const inputUtxo0 = new Utxo({
    amount: utxos[0]!.amount,
    index: utxos[0]!.index,
    keypair: vortexKeypair,
    blinding: utxos[0]!.blinding,
  });

  // Just a 0 dummy
  const inputUtxo1 = new Utxo({
    amount: utxos[1]!.amount,
    index: utxos[1]!.index,
    blinding: utxos[1]!.blinding,
    keypair: vortexKeypair,
  });

  const nextIndex = await vortex.nextIndex();

  // Output UTXOs: the actual deposit. Commitment Utxos do not need an index.
  const outputUtxo0 = new Utxo({
    amount: 250n,
    index: BigInt(nextIndex),
    keypair: vortexKeypair,
  });

  const outputUtxo1 = new Utxo({
    amount: 0n,
    index: BigInt(nextIndex) + 1n,
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
  const extDataPublicAmount = 250n;

  const proofPublicAmount = new BN(BN254_FIELD_MODULUS).sub(
    new BN(extDataPublicAmount)
  );

  const extDataPayload = {
    recipient: recipientKeypair.toSuiAddress(),
    value: extDataPublicAmount,
    valueSign: false,
    relayer: '0x0',
    relayerFee: 0n,
    encryptedOutput0: fromHex(encryptedUtxo0),
    encryptedOutput1: fromHex(encryptedUtxo1),
  };

  const extDataHash = computeExtDataHash(extDataPayload);

  const extDataHashBigInt = bytesToBigInt(reverseBytes(extDataHash));

  // Prepare circuit input
  const input = {
    // Public inputs
    root: merkleTree.root(), // Empty tree
    publicAmount: proofPublicAmount.toString(), // Withdrawing
    extDataHash: extDataHashBigInt, // No external data
    inputNullifier0: nullifier0, // No inputs
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1, // Unused output
    // Private inputs - No input UTXOs (fresh deposit)
    inPrivateKey0: vortexKeypair.privateKey,
    inPrivateKey1: vortexKeypair.privateKey,
    inAmount0: inputUtxo0.amount,
    inAmount1: inputUtxo1.amount,
    inBlinding0: inputUtxo0.blinding,
    inBlinding1: inputUtxo1.blinding,
    inPathIndex0: inputUtxo0.index,
    inPathIndex1: inputUtxo1.index,
    merklePath0: getMerklePath(merkleTree, outputUtxo0),
    merklePath1: getMerklePath(merkleTree, outputUtxo1),
    // Private inputs - Output UTXOs
    outPublicKey0: vortexKeypair.publicKey,
    outPublicKey1: vortexKeypair.publicKey,
    outAmount0: outputUtxo0.amount,
    outAmount1: outputUtxo1.amount,
    outBlinding0: outputUtxo0.blinding,
    outBlinding1: outputUtxo1.blinding,
  };

  const proofJson = prove(JSON.stringify(input), provingKey);
  const proof: Proof = JSON.parse(proofJson);

  const publicInputs = {
    root: input.root,
    publicAmount: proofPublicAmount.toString(),
    extDataHash: input.extDataHash,
    inputNullifier0: input.inputNullifier0,
    inputNullifier1: input.inputNullifier1,
    outputCommitment0: input.outputCommitment0,
    outputCommitment1: input.outputCommitment1,
  };

  return {
    proof,
    extDataHashBigInt,
    publicInputs,
    extDataPayload,
  };
};

(async () => {
  try {
    const env = await getEnv();

    const { proof, publicInputs, extDataPayload } = await withdraw(env);

    const tx = new Transaction();

    const { keypair, vortex, suiClient } = env;

    const extData = tx.moveCall({
      target: `${vortex.packageId}::vortex_ext_data::new`,
      arguments: [
        tx.pure.address(extDataPayload.recipient),
        tx.pure.u64(extDataPayload.value),
        tx.pure.bool(extDataPayload.valueSign),
        tx.pure.address(normalizeSuiAddress(extDataPayload.relayer)),
        tx.pure.u64(extDataPayload.relayerFee),
        tx.pure.vector('u8', extDataPayload.encryptedOutput0),
        tx.pure.vector('u8', extDataPayload.encryptedOutput1),
      ],
    });

    const moveProof = tx.moveCall({
      target: `${vortex.packageId}::vortex_proof::new`,
      arguments: [
        tx.pure.vector('u8', fromHex('0x' + proof.proofSerializedHex)),
        tx.pure.u256(publicInputs.root),
        tx.pure.u256(publicInputs.publicAmount),
        tx.pure.u256(publicInputs.extDataHash),
        tx.pure.u256(publicInputs.inputNullifier0),
        tx.pure.u256(publicInputs.inputNullifier1),
        tx.pure.u256(publicInputs.outputCommitment0),
        tx.pure.u256(publicInputs.outputCommitment1),
      ],
    });

    const suiCoin = tx.splitCoins(tx.gas, [tx.pure.u64(500n)]);

    tx.setSender(keypair.toSuiAddress());

    tx.moveCall({
      target: `${vortex.packageId}::vortex::transact`,
      arguments: [vortex.mutableVortexRef(tx), moveProof, extData, suiCoin],
    });

    const result = await keypair.signAndExecuteTransaction({
      transaction: tx,
      client: suiClient,
    });

    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
