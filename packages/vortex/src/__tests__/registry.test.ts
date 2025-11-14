import {
  expectDevInspectTransactionBlock,
  testVortex,
  assertValueMoveCall,
} from './test-utils';
import { VortexKeypair } from '../entities';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { OPTION_STRING_TYPE_ARGUMENT } from './types';

describe('Registry', () => {
  it('should register a new user', async () => {
    const recipient = Ed25519Keypair.generate();

    const vortexKeypair = VortexKeypair.generate();

    const encryptionKey = await testVortex.encryptionKey(
      recipient.toSuiAddress()
    );

    expect(encryptionKey).toBe('');

    const { tx } = testVortex.register({
      encryptionKey: vortexKeypair.encryptionKey,
    });

    const key = tx.moveCall({
      target: `${testVortex.packageId}::vortex::encryption_key`,
      arguments: [
        testVortex.immutableRegistryRef(tx),
        tx.pure.address(recipient.toSuiAddress()),
      ],
    });

    assertValueMoveCall({
      tx,
      typeArguments: [OPTION_STRING_TYPE_ARGUMENT],
      args: [key, tx.pure.option('string', vortexKeypair.encryptionKey)],
    });

    await expectDevInspectTransactionBlock({
      tx,
      sender: recipient.toSuiAddress(),
      expectStatus: 'success',
    });
  });

  it('should allow the user to register a new encryption key', async () => {
    const recipient = Ed25519Keypair.generate();

    const vortexKeypair = VortexKeypair.generate();
    const newVortexKeypair = VortexKeypair.generate();

    const encryptionKey = await testVortex.encryptionKey(
      recipient.toSuiAddress()
    );

    expect(encryptionKey).toBe('');

    const { tx } = testVortex.register({
      encryptionKey: vortexKeypair.encryptionKey,
    });

    const key1 = tx.moveCall({
      target: `${testVortex.packageId}::vortex::encryption_key`,
      arguments: [
        testVortex.immutableRegistryRef(tx),
        tx.pure.address(recipient.toSuiAddress()),
      ],
    });

    assertValueMoveCall({
      tx,
      typeArguments: [OPTION_STRING_TYPE_ARGUMENT],
      args: [key1, tx.pure.option('string', vortexKeypair.encryptionKey)],
    });

    const { tx: tx2 } = testVortex.register({
      tx,
      encryptionKey: newVortexKeypair.encryptionKey,
    });

    const key2 = tx2.moveCall({
      target: `${testVortex.packageId}::vortex::encryption_key`,
      arguments: [
        testVortex.immutableRegistryRef(tx2),
        tx2.pure.address(recipient.toSuiAddress()),
      ],
    });

    assertValueMoveCall({
      tx: tx2,
      typeArguments: [OPTION_STRING_TYPE_ARGUMENT],
      args: [key2, tx2.pure.option('string', newVortexKeypair.encryptionKey)],
    });

    await expectDevInspectTransactionBlock({
      tx: tx2,
      sender: recipient.toSuiAddress(),
      expectStatus: 'success',
    });
  });
});
