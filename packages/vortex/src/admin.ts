import { AdminSdkConstructorArgs } from './vortex.types';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';
import {
  NewPoolArgs,
  Modules,
  SharePoolArgs,
  SetDepositFeeArgs,
  SetWithdrawFeeArgs,
  SetGroth16VkArgs,
} from './vortex.types';
import invariant from 'tiny-invariant';

export class VortexAdminSdk {
  private packageId: string;
  private adminCap: string;

  constructor(args: AdminSdkConstructorArgs) {
    this.packageId = args.packageId;
    this.adminCap = args.adminCap;
  }

  newPool({ pool, tx = new Transaction() }: NewPoolArgs) {
    const vortex = tx.moveCall({
      package: this.packageId,
      module: Modules.vortex,
      function: 'new',
      arguments: [tx.object(this.adminCap), tx.pure.u64(pool)],
    });

    return {
      vortex,
      tx,
    };
  }

  sharePool({ tx, pool }: SharePoolArgs) {
    tx.moveCall({
      package: this.packageId,
      module: Modules.vortex,
      function: 'share',
      arguments: [pool],
    });

    return tx;
  }

  setDepositFee({ tx = new Transaction(), pool, fee }: SetDepositFeeArgs) {
    invariant(fee >= 0 && fee <= 10_000, 'Fee must be between 0 and 10_000');
    if (typeof pool === 'object') {
      tx.moveCall({
        package: this.packageId,
        module: Modules.vortex,
        function: 'set_deposit_fee',
        arguments: [pool, tx.object(this.adminCap), tx.pure.u64(fee)],
      });
    } else {
      tx.moveCall({
        package: this.packageId,
        module: Modules.vortex,
        function: 'set_deposit_fee',
        arguments: [
          tx.object(pool),
          tx.object(this.adminCap),
          tx.pure.u64(fee),
        ],
      });
    }

    return tx;
  }

  setWithdrawFee({ tx = new Transaction(), pool, fee }: SetWithdrawFeeArgs) {
    invariant(fee >= 0 && fee <= 10_000, 'Fee must be between 0 and 10_000');
    if (typeof pool === 'object') {
      tx.moveCall({
        package: this.packageId,
        module: Modules.vortex,
        function: 'set_withdraw_fee',
        arguments: [pool, tx.object(this.adminCap), tx.pure.u64(fee)],
      });
    } else {
      tx.moveCall({
        package: this.packageId,
        module: Modules.vortex,
        function: 'set_withdraw_fee',
        arguments: [
          tx.object(pool),
          tx.object(this.adminCap),
          tx.pure.u64(fee),
        ],
      });
    }

    return tx;
  }

  setGroth16Vk({ tx = new Transaction(), pool, vk }: SetGroth16VkArgs) {
    const vkBytes = fromHex(vk);

    if (typeof pool === 'object') {
      tx.moveCall({
        package: this.packageId,
        module: Modules.vortex,
        function: 'set_groth16_vk',
        arguments: [
          pool,
          tx.object(this.adminCap),
          tx.pure.vector('u8', vkBytes),
        ],
      });
    } else {
      tx.moveCall({
        package: this.packageId,
        module: Modules.vortex,
        function: 'set_groth16_vk',
        arguments: [
          tx.object(pool),
          tx.object(this.adminCap),
          tx.pure.vector('u8', vkBytes),
        ],
      });
    }

    return tx;
  }
}
