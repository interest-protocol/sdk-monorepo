import {
  TEST_VORTEX_PACKAGE_ID,
  expectDevInspectTransactionBlock,
} from '../test-utils';
import { computeExtDataHash } from '../../utils/ext-data';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

describe(computeExtDataHash.name, () => {
  it('should compute the correct hash', async () => {
    const recipient = Ed25519Keypair.generate();
    const relayer = Ed25519Keypair.generate();

    const payload = {
      vortex: TEST_VORTEX_PACKAGE_ID,
      recipient: recipient.toSuiAddress(),
      value: 1000n,
      valueSign: true,
      relayer: relayer.toSuiAddress(),
      relayerFee: 100n,
      encryptedOutput1: 2n,
      encryptedOutput2: 5n,
    };

    const extDataHash = computeExtDataHash(payload);

    const tx = new Transaction();

    tx.setSender(recipient.toSuiAddress());

    const extData = tx.moveCall({
      target: `${TEST_VORTEX_PACKAGE_ID}::vortex_ext_data::new`,
      arguments: [
        tx.pure.address(payload.vortex),
        tx.pure.address(payload.recipient),
        tx.pure.u64(payload.value),
        tx.pure.bool(payload.valueSign),
        tx.pure.address(payload.relayer),
        tx.pure.u64(payload.relayerFee),
        tx.pure.u256(payload.encryptedOutput1),
        tx.pure.u256(payload.encryptedOutput2),
      ],
    });

    tx.moveCall({
      target: `${TEST_VORTEX_PACKAGE_ID}::vortex_ext_data::assert_hash`,
      arguments: [extData, tx.pure.vector('u8', extDataHash)],
    });

    await expectDevInspectTransactionBlock({
      tx,
      sender: recipient.toSuiAddress(),
      expectStatus: 'success',
    });
  });

  it('should fail to assert hash if value sign is incorrect', async () => {
    const recipient = Ed25519Keypair.generate();
    const relayer = Ed25519Keypair.generate();

    const payload = {
      vortex: TEST_VORTEX_PACKAGE_ID,
      recipient: recipient.toSuiAddress(),
      value: 1000n,
      valueSign: true,
      relayer: relayer.toSuiAddress(),
      relayerFee: 100n,
      encryptedOutput1: 2n,
      encryptedOutput2: 5n,
    };

    const extDataHash = computeExtDataHash(payload);

    const tx = new Transaction();

    tx.setSender(recipient.toSuiAddress());

    const extData = tx.moveCall({
      target: `${TEST_VORTEX_PACKAGE_ID}::vortex_ext_data::new`,
      arguments: [
        tx.pure.address(payload.vortex),
        tx.pure.address(payload.recipient),
        tx.pure.u64(payload.value),
        tx.pure.bool(false),
        tx.pure.address(payload.relayer),
        tx.pure.u64(payload.relayerFee),
        tx.pure.u256(payload.encryptedOutput1),
        tx.pure.u256(payload.encryptedOutput2),
      ],
    });

    tx.moveCall({
      target: `${TEST_VORTEX_PACKAGE_ID}::vortex_ext_data::assert_hash`,
      arguments: [extData, tx.pure.vector('u8', extDataHash)],
    });

    await expectDevInspectTransactionBlock({
      tx,
      sender: recipient.toSuiAddress(),
      expectStatus: 'failure',
    });
  });
});
