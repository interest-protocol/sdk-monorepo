import { normalizeSuiObjectId } from '@mysten/sui/utils';

export const TIDE_AMM_PACKAGE =
  '0x863370f42741e28dbe3293276c3477ffa8ef5137c24ccb4c7eeee2eafeb570c0';

export const TIDE_ACL_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0x9027a6eba0e22cb90f0930799fbc1ea540ae222eb1aee83ed8d9d2a49f05a53f'
  ),
  initialSharedVersion: '589253478',
  mutable,
});

export const REGISTRY_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0xc2a2f9fe2b29f0714e52efa24c71d92a395bd97e030d6d0ba213f05af2e2361e'
  ),
  initialSharedVersion: '589253478',
  mutable,
});

export const SUPER_ADMIN =
  '0x55c3824a7812b7d7c2a623eb21d9ce71df904876c09dd41830e7427f24d24c38';

export const TIDE_UPGRADE_CAP =
  '0xdf819195d8620ef7b2e2bbeedbf233424a909e8988952f8091e1e02112462264';

export const PUBLISHER =
  '0xc82e7e22440b7e2cd0a9dfb459f000e160cd8c24a2f951d82bf85971a26a9f1b';

export const TIDE_AMM_OTW = `${TIDE_AMM_PACKAGE}::tide_amm::TIDE_AMM`;

export enum Roles {
  Owner = 1,
  Manager,
}

export const PYTH_STATE_ID =
  '0x1f9310238ee9298fb703c3419030b35b22bb1cc37113e3bb5007c99aec79e5b8';

export const WORMHOLE_STATE_ID =
  '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c';

export enum RebalanceAction {
  None,
  Add,
  Remove,
}

export const BASIS_POINTS = 10_000n;
