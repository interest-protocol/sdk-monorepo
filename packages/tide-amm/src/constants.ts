import { normalizeSuiObjectId } from '@mysten/sui/utils';

export const TIDE_AMM_PACKAGE =
  '0x8289643e8ae7457b2766d7b2befde0ea3702e2c1b3253fb28776a4bf0ee80f38';

export const TIDE_ACL_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0xe970bb7080bab3aaeb9963703bac8ba16d072d7a1af104455136cb95fda70a26'
  ),
  initialSharedVersion: '584368483',
  mutable,
});

export const REGISTRY_OBJECT = ({ mutable }: { mutable: boolean }) => ({
  objectId: normalizeSuiObjectId(
    '0xd39d564cfc8ecb16ede336f32d23a9d2f08ac187f52215bc3478cdf51a88e872'
  ),
  initialSharedVersion: '584368483',
  mutable,
});

export const SUPER_ADMIN =
  '0x51e75fbb21c949760227b2f8ad0513437821d91e14071649e8977265eef600f2';

export const TIDE_UPGRADE_CAP =
  '0x49a137d78c85ce0ec86265e8f48b43a33560928e7afb07e086f2426285be2068';

export const TIDE_AMM_OTW = `${TIDE_AMM_PACKAGE}::tide_amm::TIDE_AMM`;

export enum Roles {
  Manager = 1,
  Oracle,
}
