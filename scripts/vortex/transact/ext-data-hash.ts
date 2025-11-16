import { getEnv, Env } from '../utils.script';
import {
  MerkleTree,
  computeExtDataHash,
  MERKLE_TREE_HEIGHT,
  ZERO_VALUE,
  Utxo,
} from '@interest-protocol/vortex-sdk';
import { fromHex, toHex } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';

(async () => {
  try {
    const { VortexKeypair, keypair, vortex } = await getEnv();

    const vortexKeypair = await VortexKeypair.fromSuiWallet(
      keypair.toSuiAddress(),
      async (message) => keypair.signPersonalMessage(message)
    );
    const merkleTree = new MerkleTree(26);

    const nextIndex = await vortex.nextIndex();

    const utxo = new Utxo({
      amount: 500n,
      index: BigInt(nextIndex),
      keypair: vortexKeypair,
    });

    const utxo2 = new Utxo({
      amount: 0n,
      index: BigInt(nextIndex) + 1n,
      keypair: vortexKeypair,
    });

    const commitment = utxo.commitment();
    const commitment2 = utxo2.commitment();
    const nullifier = utxo.nullifier();
    const nullifier2 = utxo2.nullifier();
    const utxoPayload = utxo.payload();
    const utxoPayload2 = utxo2.payload();
    const encryptedUtxo = VortexKeypair.encryptUtxoFor(
      utxoPayload,
      vortexKeypair.encryptionKey
    );
    const encryptedUtxo2 = VortexKeypair.encryptUtxoFor(
      utxoPayload2,
      vortexKeypair.encryptionKey
    );

    const extDataHash = computeExtDataHash({
      recipient: keypair.toSuiAddress(),
      value: utxoPayload.amount,
      valueSign: true,
      relayer: '0x0',
      relayerFee: 0n,
      encryptedOutput1: fromHex(encryptedUtxo),
      encryptedOutput2: fromHex(encryptedUtxo2),
    });

    // Convert hash bytes to BigInt for u256 contract argument
    // BCS u256 serializes in little-endian format, so we need to reverse
    // the bytes when creating the BigInt so that when the contract
    // serializes it back to bytes, it matches the original hash bytes
    const reversedBytes = new Uint8Array(extDataHash.length);
    for (let i = 0; i < extDataHash.length; i++) {
      reversedBytes[i] = extDataHash[extDataHash.length - 1 - i]!;
    }
    const extDataHashBigInt = BigInt('0x' + toHex(reversedBytes));

    // Contract compares:
    // 1. BCS serialization of the u256 (from BigInt argument) - 32 bytes
    // 2. BCS serialization of the extDataHash bytes (as vector<u8>) - has length prefix
    const serializedU256 = bcs.u256().serialize(extDataHashBigInt).toBytes();
    const serializedHashAsVector = bcs
      .vector(bcs.u8())
      .serialize(extDataHash)
      .toBytes();

    // vector<u8> has a length prefix (1 byte), so we compare:
    // - u256 bytes (32 bytes)
    // - vector data bytes (skip length prefix, compare 32 bytes)
    const vectorDataBytes = serializedHashAsVector.slice(1); // Skip length prefix
    const bcsBytesMatch =
      serializedU256.length === vectorDataBytes.length &&
      serializedU256.every((byte, i) => byte === vectorDataBytes[i]);

    console.log('Original extDataHash bytes (from hash):', toHex(extDataHash));
    console.log('BCS serialized u256 bytes (32 bytes):', toHex(serializedU256));
    console.log(
      'BCS serialized extDataHash as vector<u8> (full, with length prefix):',
      toHex(serializedHashAsVector)
    );
    console.log(
      'BCS serialized extDataHash as vector<u8> (data only, no length prefix):',
      toHex(vectorDataBytes)
    );
    console.log('BCS bytes match (u256 vs vector data bytes):', bcsBytesMatch);
    console.log(
      'ExtDataHash as BigInt (pass to contract as u256):',
      extDataHashBigInt
    );

    if (!bcsBytesMatch) {
      throw new Error(
        'BCS bytes do not match! The contract comparison will fail.'
      );
    }

    // Return the BigInt value that can be used in contract calls
    // Use: tx.pure.u256(extDataHashBigInt)
  } catch (error) {
    console.log(error);
  }
})();
