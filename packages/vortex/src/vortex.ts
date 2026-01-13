import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  ConstructorArgs,
  RegisterArgs,
  SharedObjectData,
  NewExtDataArgs,
  Action,
  NewProofArgs,
  VortexPool,
  TransactArgs,
  IsNullifierSpentArgs,
  AreNullifiersSpentArgs,
  NewArgs,
  NewAccountArgs,
  MergeCoinsArgs,
  TransactWithAccountArgs,
  StartSwapArgs,
  FinishSwapArgs,
  ProveFn,
  VerifyFn,
  NewSecretAccountArgs,
  DeleteSecretAccountArgs,
} from './vortex.types';
import { devInspectAndGetReturnValues } from '@polymedia/suitcase-core';
import { bcs } from '@mysten/sui/bcs';
import invariant from 'tiny-invariant';
import { normalizeSuiAddress, normalizeStructTag } from '@mysten/sui/utils';
import { pathOr } from 'ramda';
import { BN254_FIELD_MODULUS } from './constants';
import { parseVortexPool, parseSecretAccount } from './utils';

export class Vortex {
  #suiClient: SuiClient;

  packageId: string;
  swapPackageId: string;
  secretPackageId: string;
  registry: SharedObjectData;
  prove: ProveFn;
  verify: VerifyFn;

  secretAccountType: string;

  #newPoolEventType: string;
  #newAccountEventType: string;
  #newCommitmentEventType: string;
  #nullifierSpentEventType: string;
  #newEncryptionKeyEventType: string;

  constructor({
    registry,
    packageId,
    swapPackageId,
    secretPackageId,
    prove,
    verify,
    fullNodeUrl = getFullnodeUrl('testnet'),
  }: ConstructorArgs) {
    this.#suiClient = new SuiClient({
      url: fullNodeUrl,
    });

    this.#newPoolEventType = `${packageId}::vortex_events::NewPool`;
    this.#newAccountEventType = `${packageId}::vortex_events::NewAccount`;
    this.#newCommitmentEventType = `${packageId}::vortex_events::NewCommitment`;
    this.#nullifierSpentEventType = `${packageId}::vortex_events::NullifierSpent`;
    this.#newEncryptionKeyEventType = `${packageId}::vortex_events::NewEncryptionKey`;

    this.secretAccountType = `${secretPackageId}::secret::Secret`;

    this.swapPackageId = swapPackageId;
    this.packageId = packageId;
    this.secretPackageId = secretPackageId;
    this.registry = registry;
    this.prove = prove;
    this.verify = verify;
  }

  newAccount({ tx = new Transaction(), hashedSecret }: NewAccountArgs) {
    const account = tx.moveCall({
      target: `${this.packageId}::vortex_account::new`,
      arguments: [tx.pure.u256(hashedSecret)],
    });

    return { tx, account };
  }

  mergeCoins({
    tx = new Transaction(),
    account,
    coinType,
    coins,
  }: MergeCoinsArgs) {
    tx.moveCall({
      target: `${this.packageId}::vortex_account::merge_coins`,
      arguments: [
        tx.object(account),
        tx.makeMoveVec({
          elements: coins.map((coin) =>
            tx.receivingRef({
              objectId: coin.objectId,
              version: coin.version,
              digest: coin.digest,
            })
          ),
          type: `0x2::transfer::Receiving<0x2::coin::Coin<${coinType}>>`,
        }),
      ],
      typeArguments: [normalizeStructTag(coinType)],
    });
  }

  register({ tx = new Transaction(), encryptionKey }: RegisterArgs) {
    tx.moveCall({
      target: `${this.packageId}::vortex::register`,
      arguments: [this.mutableRegistryRef(tx), tx.pure.string(encryptionKey)],
    });

    return { tx };
  }

  newPool({ tx = new Transaction(), coinType }: NewArgs) {
    const vortexPool = tx.moveCall({
      target: `${this.packageId}::vortex::new`,
      arguments: [this.mutableRegistryRef(tx)],
      typeArguments: [coinType],
    });

    return { tx, vortexPool };
  }

  newPoolAndShare({ tx = new Transaction(), coinType }: NewArgs) {
    const vortexPool = tx.moveCall({
      target: `${this.packageId}::vortex::new`,
      arguments: [this.mutableRegistryRef(tx)],
      typeArguments: [coinType],
    });

    tx.moveCall({
      target: `${this.packageId}::vortex::share`,
      arguments: [tx.object(vortexPool)],
      typeArguments: [coinType],
    });

    return { tx };
  }

  newSecretAccount({
    tx = new Transaction(),
    encryptedSecret,
  }: NewSecretAccountArgs) {
    const secretAccount = tx.moveCall({
      target: `${this.secretPackageId}::secret::new`,
      arguments: [tx.pure.string(encryptedSecret)],
    });

    tx.moveCall({
      target: `${this.secretPackageId}::secret::keep`,
      arguments: [secretAccount],
    });

    return { tx };
  }

  deleteSecretAccount({
    tx = new Transaction(),
    secretAccountObjectId,
  }: DeleteSecretAccountArgs) {
    tx.moveCall({
      target: `${this.secretPackageId}::secret::delete`,
      arguments: [tx.object(secretAccountObjectId)],
    });

    return { tx };
  }

  async getAllSecretAccounts(account: string) {
    const secretAccounts = await this.#suiClient.getOwnedObjects({
      owner: account,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        StructType: this.secretAccountType,
      },
    });

    return secretAccounts.data.map((data) => {
      invariant(data.data, 'Secret account data not found');
      return parseSecretAccount(data.data);
    });
  }

  async vortexAddress(coinType: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::vortex_address`,
      arguments: [this.immutableRegistryRef(tx)],
      typeArguments: [coinType],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.option(bcs.Address)],
    ]);

    invariant(result[0], 'Vortex address devInspectAndGetReturnValues failed');

    const option = result[0][0] as string | null;

    return option ? normalizeSuiAddress(option) : null;
  }

  async encryptionKey(user: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::encryption_key`,
      arguments: [this.immutableRegistryRef(tx), tx.pure.address(user)],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.String],
    ]);

    invariant(result[0], 'Encryption key devInspectAndGetReturnValues failed');

    return result[0][0] as string;
  }

  newExtData({
    tx = new Transaction(),
    value,
    action,
    relayer,
    relayerFee,
    encryptedOutput1,
    encryptedOutput0,
  }: NewExtDataArgs) {
    const extData = tx.moveCall({
      target: `${this.packageId}::vortex_ext_data::new`,
      arguments: [
        tx.pure.u64(value),
        tx.pure.bool(action === Action.Deposit), // true for deposit, false for withdraw
        tx.pure.address(relayer),
        tx.pure.u64(relayerFee),
        tx.pure.vector('u8', encryptedOutput0),
        tx.pure.vector('u8', encryptedOutput1),
      ],
    });

    return { tx, extData };
  }

  async newProof({
    tx = new Transaction(),
    vortexPool,
    proofPoints,
    root,
    publicValue,
    action,
    inputNullifier0,
    inputNullifier1,
    outputCommitment0,
    outputCommitment1,
  }: NewProofArgs) {
    const value =
      action === Action.Deposit
        ? publicValue
        : BN254_FIELD_MODULUS - publicValue;

    const vortex = await this.resolveVortexPool(vortexPool);

    const proof = tx.moveCall({
      target: `${this.packageId}::vortex_proof::new`,
      arguments: [
        tx.pure.address(vortex.objectId),
        tx.pure.vector('u8', proofPoints),
        tx.pure.u256(root),
        tx.pure.u256(value),
        tx.pure.u256(inputNullifier0),
        tx.pure.u256(inputNullifier1),
        tx.pure.u256(outputCommitment0),
        tx.pure.u256(outputCommitment1),
      ],
      typeArguments: [vortex.coinType],
    });

    return { tx, proof };
  }

  async transact({
    tx = new Transaction(),
    vortexPool,
    proof,
    extData,
    deposit,
  }: TransactArgs) {
    const vortex = await this.resolveVortexPool(vortexPool);

    const coin = tx.moveCall({
      target: `${this.packageId}::vortex::transact`,
      arguments: [tx.object(vortex.objectId), deposit, proof, extData],
      typeArguments: [vortex.coinType],
    });

    return { tx, coin };
  }

  async transactWithAccount({
    tx = new Transaction(),
    vortexPool,
    account,
    coins,
    proof,
    extData,
  }: TransactWithAccountArgs) {
    const vortex = await this.resolveVortexPool(vortexPool);

    const coin = tx.moveCall({
      target: `${this.packageId}::vortex::transact_with_account`,
      arguments: [
        tx.object(vortex.objectId),
        tx.object(account),
        tx.makeMoveVec({
          elements: coins.map((coin) =>
            tx.receivingRef({
              objectId: coin.objectId,
              version: coin.version,
              digest: coin.digest,
            })
          ),
          type: `0x2::transfer::Receiving<0x2::coin::Coin<${vortex.coinType}>>`,
        }),
        proof,
        extData,
      ],
      typeArguments: [vortex.coinType],
    });

    return { tx, coin };
  }

  async tvl(vortex: string) {
    const object = await this.#suiClient.getObject({
      id: vortex,
      options: {
        showContent: true,
      },
    });

    invariant(object.data, 'Vortex object data not found');

    const content = object.data.content;

    return BigInt(pathOr(0, ['fields', 'balance'], content));
  }

  async root(vortex: string) {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::root`,
      arguments: [tx.object(vortex)],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.u256()],
    ]);

    invariant(result[0], 'Root devInspectAndGetReturnValues failed');

    return BigInt(result[0][0] as string);
  }

  async nextIndex(vortexPool: string | VortexPool) {
    const tx = new Transaction();

    const vortex = await this.resolveVortexPool(vortexPool);

    tx.moveCall({
      target: `${this.packageId}::vortex::next_index`,
      arguments: [tx.object(vortex.objectId)],
      typeArguments: [vortex.coinType],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.u64()],
    ]);

    invariant(result[0], 'Next index devInspectAndGetReturnValues failed');

    return BigInt(result[0][0] as string);
  }

  async isNullifierSpent({ nullifier, vortexPool }: IsNullifierSpentArgs) {
    const vortex = await this.resolveVortexPool(vortexPool);

    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::vortex::is_nullifier_spent`,
      arguments: [tx.object(vortex.objectId), tx.pure.u256(nullifier)],
      typeArguments: [vortex.coinType],
    });

    const result = await devInspectAndGetReturnValues(this.#suiClient, tx, [
      [bcs.Bool],
    ]);

    invariant(
      result[0],
      'Is nullifier spent devInspectAndGetReturnValues failed'
    );

    return result[0][0] as boolean;
  }

  async areNullifiersSpent({ nullifiers, vortexPool }: AreNullifiersSpentArgs) {
    const vortex = await this.resolveVortexPool(vortexPool);

    if (nullifiers.length === 0) return [];

    const tx = new Transaction();

    nullifiers.forEach((nullifier) => {
      tx.moveCall({
        target: `${this.packageId}::vortex::is_nullifier_spent`,
        arguments: [tx.object(vortex.objectId), tx.pure.u256(nullifier)],
        typeArguments: [vortex.coinType],
      });
    });

    const result = await devInspectAndGetReturnValues(
      this.#suiClient,
      tx,
      nullifiers.map(() => [bcs.Bool])
    );

    invariant(
      result[0],
      'Is nullifier spent devInspectAndGetReturnValues failed'
    );

    return result.flat() as boolean[];
  }

  async startSwap({
    tx = new Transaction(),
    vortex,
    proof,
    extData,
    relayer,
    minAmountOut,
    coinOutType,
  }: StartSwapArgs) {
    const vortexPool = await this.resolveVortexPool(vortex);

    const [receipt, coinIn] = tx.moveCall({
      target: `${this.swapPackageId}::vortex_swap::start_swap`,
      arguments: [
        tx.object(vortexPool.objectId),
        proof,
        extData,
        tx.pure.address(relayer),
        tx.pure.u64(minAmountOut),
      ],
      typeArguments: [vortexPool.coinType, coinOutType],
    });

    return { tx, receipt, coinIn };
  }

  async finishSwap({
    tx = new Transaction(),
    vortex,
    coinOut,
    proof,
    extData,
    receipt,
    coinInType,
  }: FinishSwapArgs) {
    const vortexPool = await this.resolveVortexPool(vortex);

    tx.moveCall({
      target: `${this.swapPackageId}::vortex_swap::finish_swap`,
      arguments: [
        tx.object(vortexPool.objectId),
        coinOut,
        receipt,
        proof,
        extData,
      ],
      typeArguments: [coinInType, vortexPool.coinType],
    });

    return { tx };
  }

  async getVortexPool(objectId: string): Promise<VortexPool> {
    const objectResponse = await this.#suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
      },
    });

    invariant(objectResponse.data, 'Vortex pool object data not found');

    return parseVortexPool(objectResponse.data);
  }

  getNewPoolEvent(coinType: string) {
    return `${this.#newPoolEventType}<${coinType}>`;
  }

  getNewAccountEvent() {
    return this.#newAccountEventType;
  }

  getNewCommitmentEvent(coinType: string) {
    return `${this.#newCommitmentEventType}<${coinType}>`;
  }

  getNullifierSpentEvent(coinType: string) {
    return `${this.#nullifierSpentEventType}<${coinType}>`;
  }

  getNewEncryptionKeyEvent() {
    return this.#newEncryptionKeyEventType;
  }

  immutableRegistryRef(tx: Transaction) {
    return tx.sharedObjectRef({
      objectId: this.registry.objectId,
      initialSharedVersion: this.registry.initialSharedVersion,
      mutable: false,
    });
  }

  mutableRegistryRef(tx: Transaction) {
    return tx.sharedObjectRef({
      objectId: this.registry.objectId,
      initialSharedVersion: this.registry.initialSharedVersion,
      mutable: true,
    });
  }

  async resolveVortexPool(vortex: string | VortexPool): Promise<VortexPool> {
    return typeof vortex === 'string' ? this.getVortexPool(vortex) : vortex;
  }
}
