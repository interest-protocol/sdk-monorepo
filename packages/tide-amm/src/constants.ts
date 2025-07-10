import { normalizeSuiObjectId } from '@mysten/sui/utils';

export const TIDE_AMM_PACKAGE =
  '0xb573a182eeeb7d3badb985eebe7905258fd357f1346c71942d613bc44fc38457';

export const TIDE_ACL_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0xf8bfb58ba57fd8f4c10510dd90ede423e854444b651cf7a561692bd3f20c5c27'
  ),
  initialSharedVersion: '584368629',
  mutable,
});

export const REGISTRY_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0xfbdeae754e4797c7be8adbf78dd5ff5496728375dd3e9cd3fb999ab86ca532fb'
  ),
  initialSharedVersion: '584368629',
  mutable,
});

export const SUPER_ADMIN =
  '0x85ca0d2dcd1ca9e01b6beb8ad3e3e1fbbfab32bee23d05a9b0c022aee6ec78ea';

export const TIDE_UPGRADE_CAP =
  '0x2c09758c93c4bd1810ea7dffda006900b507c6a55c482b980d058db5065fe756';

export const PUBLISHER =
  '0x4ed98202a7eaaf876e108cd2aaff0a303c48a3c08f5cb44a7ecc556177c6f686';

export const TIDE_AMM_OTW = `${TIDE_AMM_PACKAGE}::tide_amm::TIDE_AMM`;

export enum Roles {
  Owner = 1,
  Manager,
}
