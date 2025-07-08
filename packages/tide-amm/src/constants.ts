import { normalizeSuiObjectId } from '@mysten/sui/utils';

export const TIDE_AMM_PACKAGE =
  '0x13d249e4640e695f0b1fc7a214c265df65d3e581de6a6b4b5053d8da9666b4ec';

export const TIDE_ACL_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0xab438325178df67de4f949b980b0240857b0e9811718fa2e74f5eb82447de2ca'
  ),
  initialSharedVersion: '571344445',
  mutable,
});

export const REGISTRY_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0x99b1ab426e662cc4c8b78f9c69fd50fde7e198d0b56b222e121f0de00298c10b'
  ),
  initialSharedVersion: '571344445',
  mutable,
});

export const SUPER_ADMIN =
  '0x5319825dd13fb92b52b19759d2d9a2eb756def54e03265f140b911da45012c4b';

export const TIDE_AMM_OTW = `${TIDE_AMM_PACKAGE}::tide_amm::TIDE_AMM`;

export enum Roles {
  Manager = 1,
  Oracle,
}
