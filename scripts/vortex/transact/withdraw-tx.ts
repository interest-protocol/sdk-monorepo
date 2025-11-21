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
  toProveInput,
  Action,
} from '@interest-protocol/vortex-sdk';
import { logInfo } from '@interest-protocol/logger';
import { fromHex, normalizeSuiAddress } from '@mysten/sui/utils';
import { prove } from '../pkg/nodejs/vortex';

import { BN } from 'bn.js';

export const withdraw = async ({
  VortexKeypair,
  keypair,
  vortex,
  provingKey,
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
    (a, b) => new BN(a.index).cmp(new BN(b.index))
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

  utxos.sort((a, b) => new BN(b.amount).cmp(new BN(a.amount)));

  logInfo('utxos', utxos);

  const merkleTree = new MerkleTree(26);

  merkleTree.bulkInsert(
    parsedCommitmentEvents.map((event) => event.commitment)
  );

  const inputTxos = utxos.slice(0, 2);

  console.log('inputTxos', inputTxos);

  // Consuming 500
  const inputUtxo0 = new Utxo({
    amount: inputTxos[0]!.amount,
    index: inputTxos[0]!.index,
    keypair: vortexKeypair,
    blinding: inputTxos[0]!.blinding,
  });

  // Just a 0 dummy
  const inputUtxo1 = new Utxo({
    amount: inputTxos[1]!.amount,
    index: inputTxos[1]!.index,
    blinding: inputTxos[1]!.blinding,
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

  const input = toProveInput({
    merkleTree,
    publicAmount: BigInt(proofPublicAmount.toString()),
    extDataHash: extDataHashBigInt,
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

  const proofJson = prove(JSON.stringify(input), provingKey);
  const proof: Proof = JSON.parse(proofJson);

  const publicInputs = {
    root: input.root,
    value: extDataPublicAmount,
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
    encryptedUtxo0,
    encryptedUtxo1,
  };
};

(async () => {
  try {
    const env = await getEnv();

    const {
      proof,
      publicInputs,
      extDataPayload,
      encryptedUtxo0,
      encryptedUtxo1,
    } = await withdraw(env);

    const { keypair, vortex, suiClient } = env;

    const { extData, tx } = vortex.newExtData({
      recipient: extDataPayload.recipient,
      value: extDataPayload.value,
      action: Action.Withdraw,
      relayer: normalizeSuiAddress(extDataPayload.relayer),
      relayerFee: extDataPayload.relayerFee,
      encryptedOutput0: fromHex(encryptedUtxo0),
      encryptedOutput1: fromHex(encryptedUtxo1),
    });

    tx.setSender(keypair.toSuiAddress());

    const { proof: moveProof, tx: tx2 } = vortex.newProof({
      tx,
      proofPoints: fromHex('0x' + proof.proofSerializedHex),
      root: publicInputs.root,
      publicValue: BigInt(publicInputs.publicAmount),
      action: Action.Withdraw,
      extDataHash: publicInputs.extDataHash,
      inputNullifier0: publicInputs.inputNullifier0,
      inputNullifier1: publicInputs.inputNullifier1,
      outputCommitment0: publicInputs.outputCommitment0,
      outputCommitment1: publicInputs.outputCommitment1,
    });

    const suiCoin = tx2.splitCoins(tx.gas, [tx.pure.u64(0n)]);

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
