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
import invariant from 'tiny-invariant';
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

  console.log('TypeScript tree root:', merkleTree.root().toString());
  console.log('On-chain root:      ', await vortex.root());
  console.log(
    'Roots match:',
    merkleTree.root().toString() === (await vortex.root()).toString()
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

  console.log('\n=== WITHDRAW TRANSACTION DEBUG ===');
  console.log('Total UTXOs found:', utxos.length);
  console.log('Input UTXO 0:', {
    index: inputUtxo0.index,
    amount: inputUtxo0.amount,
    commitment: inputUtxo0.commitment().toString().slice(0, 20) + '...',
    nullifier: nullifier0.toString().slice(0, 20) + '...',
  });
  console.log('Input UTXO 1:', {
    index: inputUtxo1.index,
    amount: inputUtxo1.amount,
    commitment: inputUtxo1.commitment().toString().slice(0, 20) + '...',
    nullifier: nullifier1.toString().slice(0, 20) + '...',
  });

  console.log('\n=== MERKLE TREE STATE ===');
  console.log('Tree root (TS):      ', merkleTree.root().toString());
  console.log('Tree root (on-chain):', await vortex.root());
  console.log('Tree size:', merkleTree.elements().length);
  console.log('Commitments in tree:');
  merkleTree.elements().forEach((c, i) => {
    console.log(`  [${i}]: ${c.toString().slice(0, 20)}...`);
  });

  // Verify the tree root matches before generating paths
  const onChainRoot = await vortex.root();
  const tsRoot = merkleTree.root().toString();
  invariant(
    tsRoot === onChainRoot,
    `Tree roots don't match! TS: ${tsRoot}, Chain: ${onChainRoot}`
  );

  console.log('\n=== GENERATING MERKLE PATHS ===');
  const merklePath0 = getMerklePath(merkleTree, inputUtxo0);
  const merklePath1 = getMerklePath(merkleTree, inputUtxo1);

  console.log('\n=== PREPARING CIRCUIT INPUT ===');
  const input = {
    // Public inputs
    root: merkleTree.root(),
    publicAmount: proofPublicAmount.toString(),
    extDataHash: extDataHashBigInt,
    inputNullifier0: nullifier0,
    inputNullifier1: nullifier1,
    outputCommitment0: commitment0,
    outputCommitment1: commitment1,

    // Private inputs - Input UTXOs
    inPrivateKey0: vortexKeypair.privateKey,
    inPrivateKey1: vortexKeypair.privateKey,
    inAmount0: inputUtxo0.amount,
    inAmount1: inputUtxo1.amount,
    inBlinding0: inputUtxo0.blinding,
    inBlinding1: inputUtxo1.blinding,
    inPathIndex0: inputUtxo0.index,
    inPathIndex1: inputUtxo1.index,
    merklePath0: merklePath0,
    merklePath1: merklePath1,

    // Private inputs - Output UTXOs
    outPublicKey0: vortexKeypair.publicKey,
    outPublicKey1: vortexKeypair.publicKey,
    outAmount0: outputUtxo0.amount,
    outAmount1: outputUtxo1.amount,
    outBlinding0: outputUtxo0.blinding,
    outBlinding1: outputUtxo1.blinding,
  };

  console.log('Circuit input summary:');
  console.log('  root:', input.root.toString().slice(0, 20) + '...');
  console.log('  publicAmount:', input.publicAmount.slice(0, 20) + '...');
  console.log('  inAmount0:', input.inAmount0);
  console.log('  inAmount1:', input.inAmount1);
  console.log('  outAmount0:', input.outAmount0);
  console.log('  outAmount1:', input.outAmount1);
  console.log('  merklePath0 levels:', merklePath0.length);
  console.log('  merklePath1 levels:', merklePath1.length);

  console.log('\n=== GENERATING PROOF ===');
  console.log('This may take 5-15 seconds...');

  try {
    const proofJson = prove(JSON.stringify(input), provingKey);
    const proof: Proof = JSON.parse(proofJson);
    console.log('✅ PROOF GENERATED SUCCESSFULLY');

    // ... rest of your code
  } catch (error) {
    console.error('\n❌ PROOF GENERATION FAILED');
    console.error('Error:', error);

    // Additional debug info
    console.log('\nInput that failed:');
    console.log(
      JSON.stringify(
        input,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    );

    throw error;
  }

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
