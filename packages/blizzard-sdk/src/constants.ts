import { normalizeSuiAddress, normalizeSuiObjectId } from '@mysten/sui/utils';

import { OwnedObjects, Package } from './blizzard.types';

export enum Modules {
  AllowedVersions = 'blizzard_allowed_versions',
  Protocol = 'blizzard_protocol',
  StakeNFT = 'blizzard_stake_nft',
  ACL = 'blizzard_acl',
  WithdrawIX = 'blizzard_withdraw_ix',
  Utils = 'blizzard_utils',
  Hooks = 'blizzard_hooks',
  WalrusStaking = 'staking',
}

export const INNER_WALRUS_STAKING_ID =
  '0x16f1f9fcdf5a746da423d1ad055d88f88b24a9272ca8afb4c0dcf074ae6c730a';

export const PACKAGES: Package = {
  WWAL: {
    original: normalizeSuiAddress(
      '0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf'
    ),
    latest: normalizeSuiAddress(
      '0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf'
    ),
  },
  UP_WAL: {
    original: normalizeSuiAddress(
      '0x615b29e7cf458a4e29363a966a01d6a6bf5026349bb4e957daa61ca9ffff639d'
    ),
    latest: normalizeSuiAddress(
      '0x615b29e7cf458a4e29363a966a01d6a6bf5026349bb4e957daa61ca9ffff639d'
    ),
  },
  BREAD_WAL: {
    original: normalizeSuiAddress(
      '0x5f70820b716a1d83580e5cf36dd0d0915b8763e1b85e3ef3db821ff40846be44'
    ),
    latest: normalizeSuiAddress(
      '0x5f70820b716a1d83580e5cf36dd0d0915b8763e1b85e3ef3db821ff40846be44'
    ),
  },
  PWAL: {
    original: normalizeSuiAddress(
      '0x0f03158a2caec1b656ee929007d08e58d620eeabeacac90ea7657d8b386b00b9'
    ),
    latest: normalizeSuiAddress(
      '0x0f03158a2caec1b656ee929007d08e58d620eeabeacac90ea7657d8b386b00b9'
    ),
  },
  NWAL: {
    original: normalizeSuiAddress(
      '0xd8b855d48fb4d8ffbb5c4a3ecac27b00f3712ce58626deb5a16a290e0c6edf84'
    ),
    latest: normalizeSuiAddress(
      '0xd8b855d48fb4d8ffbb5c4a3ecac27b00f3712ce58626deb5a16a290e0c6edf84'
    ),
  },
  MWAL: {
    original: normalizeSuiAddress(
      '0x64e081287af3fb4eb5720137348661493203d48535f582577177fcd3b253805f'
    ),
    latest: normalizeSuiAddress(
      '0x64e081287af3fb4eb5720137348661493203d48535f582577177fcd3b253805f'
    ),
  },
  TR_WAL: {
    original: normalizeSuiAddress(
      '0xa8ad8c2720f064676856f4999894974a129e3d15386b3d0a27f3a7f85811c64a'
    ),
    latest: normalizeSuiAddress(
      '0xa8ad8c2720f064676856f4999894974a129e3d15386b3d0a27f3a7f85811c64a'
    ),
  },
  BLIZZARD: {
    original: normalizeSuiAddress(
      '0x29ba7f7bc53e776f27a6d1289555ded2f407b4b1a799224f06b26addbcd1c33d'
    ),
    latest: normalizeSuiAddress(
      '0x1a6a6bfd4d6d2aa9af72f6804d9330873b44bfd0e1405005ae19587539fd2c58'
    ),
  },
  BLIZZARD_HOOKS: {
    original: normalizeSuiAddress(
      '0x2577491eda369564e2c1537215a213d87fa68dab7b6f5d7bb72f3b6857025614'
    ),
    latest: normalizeSuiAddress(
      '0x2577491eda369564e2c1537215a213d87fa68dab7b6f5d7bb72f3b6857025614'
    ),
  },
  WAL: {
    original: normalizeSuiAddress(
      '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59'
    ),
    latest: normalizeSuiAddress(
      '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59'
    ),
  },
  WALRUS: {
    original: normalizeSuiAddress(
      '0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77'
    ),
    latest: normalizeSuiAddress(
      '0xfa65cb2d62f4d39e60346fb7d501c12538ca2bbc646eaa37ece2aec5f897814e'
    ),
  },
  BLIZZARD_UTILS: {
    original: normalizeSuiAddress(
      '0x09c21cbfd644a670d9f0bb8348aaac859009c89ccda9193a7cfa2d74c029cf49'
    ),
    latest: normalizeSuiAddress(
      '0x09c21cbfd644a670d9f0bb8348aaac859009c89ccda9193a7cfa2d74c029cf49'
    ),
  },
} as const;

export const OWNED_OBJECTS: OwnedObjects = {
  WWAL_UPGRADE_CAP: normalizeSuiObjectId(
    '0xdb3ce9226913db734f514ef2f3463c04fdafe59f057c9a90aab994e276b155d1'
  ),
  BLIZZARD_UPGRADE_CAP: normalizeSuiObjectId(
    '0xf77b750e8546131b9fbb91434b70f9a642fd074c31a108cddd888549c8e1d9ac'
  ),
  BLIZZARD_STAKE_NFT_PUBLISHER: normalizeSuiAddress(
    '0x2a0d528f1b78f5c25c43f4f73736493c20ad4e5d1dc53935373ef3212cbffae6'
  ),
  BLIZZARD_SUPER_ADMIN: normalizeSuiAddress(
    '0x4c2321cfa370fdeadd3c2bf47730365b9abc0ec9f6161d191af8bf8fd76d70fd'
  ),
  BLIZZARD_PUBLISHER: normalizeSuiAddress(
    '0xaae6c78f20889a9f0af7c35b4744699abea5b11e0f3a106c02bc63fd8674c20d'
  ),
  BLIZZARD_STAKE_NFT_DISPLAY: normalizeSuiAddress(
    '0x229b40abcabeccb268c85aac9091101a635a21e602dcfd2d7ff1ef153f0ff9c3'
  ),
  HOOKS_UPGRADE_CAP: normalizeSuiObjectId(
    '0x5e566949b8da83f7392293be6bf2f57167722aaf62ac92d6f882ffa656e61e82'
  ),
  WWAL_SUPER_ADMIN: normalizeSuiAddress(
    '0xf4c2e773f52cfdeb54e4393f9a4f21ee13064bed902bfe948863406debf7d99c'
  ),
  BLIZZARD_UTILS_UPGRADE_CAP: normalizeSuiObjectId(
    '0x671b96e76cb85bdadc1bb27591e681b63a32396acd7933d70b05e02240099e0f'
  ),
  BLIZZARD_ADMIN: normalizeSuiAddress(
    '0xf628949db97fa4d7b1fb190c108264d85d471efab4146dca5bf3b4320532f966'
  ),
  WWAL_ADMIN: normalizeSuiAddress(
    '0x110c2c257c4fb6fb346a40441b2f478192f7219db9f54b044a93c6370a394ce6'
  ),
  BREAD_WAL_SUPER_ADMIN: normalizeSuiAddress(
    '0x0de83d626d1ed8ab2e337a8cb306c1136858cfed0b0ca41b4cbbdc91224f89da'
  ),
  PWAL_SUPER_ADMIN: normalizeSuiAddress(
    '0x4f0dbb94b3743c63da78bfb9f4edfeb37655306fd84138a4d3f678a9c27ff8cf'
  ),
  NWAL_SUPER_ADMIN: normalizeSuiAddress(
    '0x94a6a2d1f6a677a9f163e78ab291f879a8bfa75c25cba4b60c8e610e1090e5d9'
  ),
  UP_WAL_SUPER_ADMIN: normalizeSuiAddress(
    '0x945a183ad012e623408a892328a11f6fbbe2b7d77f5880a47c1d668a8cdceaf2'
  ),
  MWAL_SUPER_ADMIN: normalizeSuiAddress(
    '0x0d5f13312fbc1645e9c23839049191b03d46f0742acd1dda3f086bbf55923284'
  ),
  TR_WAL_SUPER_ADMIN: normalizeSuiAddress(
    '0xb822aeac79d7786d227986165f6a55768b4d7232545593b2724037dde2f73307'
  ),
} as const;

export const SHARED_OBJECTS = {
  WALRUS_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904'
    ),
    initialSharedVersion: '317862159',
    mutable,
  }),
  WWAL_COIN_METADATA: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xb99b3755f138d5a56b3bbc1b9cc19ed7da9be82c79844b39ff84d5c438ee5c40'
    ),
    initialSharedVersion: '511167558',
    mutable,
  }),
  BLIZZARD_AV: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x4199e3c5349075a98ec0b6100c7f1785242d97ba1f9311ce7a3a021a696f9e4a'
    ),
    initialSharedVersion: '511167559',
    mutable,
  }),
  BLIZZARD_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x4796e5ff6ea2002736a2491b096ae01fa1940de982c4a2dd3810e5936cdc648d'
    ),
    initialSharedVersion: '511167559',
    mutable,
  }),
  WWAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x274e6692465b9c5f2057d63b3f328c67286d96c15beffb0909aa00fc34bbd0c4'
    ),
    initialSharedVersion: '511181119',
    mutable,
  }),
  WWAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xccf034524a2bdc65295e212128f77428bb6860d757250c43323aa38b3d04df6d'
    ),
    initialSharedVersion: '511181119',
    mutable,
  }),
  PWAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xd355b8e62f16418a02879de9bc4ab15c4dad9dd2966d15645e1674689bfbc8b9'
    ),
    initialSharedVersion: '511946394',
    mutable,
  }),
  PWAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x8cb63927925e324164fba2dc555b7e27a00ed4ae80d27c58ce8cf5c4eb61f375'
    ),
    initialSharedVersion: '511946394',
    mutable,
  }),
  BREAD_WAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xc75f916f5cdc94664f58f5e8284a70ef69f973d62cd9841584bc70200a98a8b7'
    ),
    initialSharedVersion: '512115338',
    mutable,
  }),
  BREAD_WAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xb5b5ab03541ed4709c6102d41c8cd34edf3ce8e8b493ed8ea531046281ba3f4c'
    ),
    initialSharedVersion: '512115338',
    mutable,
  }),
  NWAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x75c4a3d4f78aa3157e2ab6e8dfb2230432272c23ab9392b10a2212e4b2fcc9f9'
    ),
    initialSharedVersion: '512202210',
    mutable,
  }),
  NWAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x6cf34551aacb518179a5266773372385e93ed25d4a3b077d86b6f07b141c7ec5'
    ),
    initialSharedVersion: '512202210',
    mutable,
  }),
  UP_WAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xea46b7a355838191205aca848fa7e244d976d8711276a2fcbe6be96bc8183b0e'
    ),
    initialSharedVersion: '513318745',
    mutable,
  }),
  UP_WAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0xa3d69fdb63cbeaec068e8739fe7bda05a184f82999d1e76f0c0f5e9a29e297ed'
    ),
    initialSharedVersion: '513318745',
    mutable,
  }),
  MWAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x3f4b6ed1459ffaa6d0f5a89b15ba6fed9098982d103e0a84ccebdf024b82ffe5'
    ),
    initialSharedVersion: '513336587',
    mutable,
  }),
  MWAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x1c98a3851302351913b34491a07930e83b1bd502cf1c6e9428b1c5d690d1e074'
    ),
    initialSharedVersion: '513336587',
    mutable,
  }),
  TR_WAL_STAKING: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x76d5f7309ac302c10aa91d72ab7d48252a840816c39764293e986ce90c3c4a0d'
    ),
    initialSharedVersion: '525079391',
    mutable,
  }),
  TR_WAL_ACL: ({ mutable }: { mutable: boolean }) => ({
    objectId: normalizeSuiObjectId(
      '0x884199c5cc097796bbb3af86dcde88f7d132b2fc1a05e03b48eadf52536c35a9'
    ),
    initialSharedVersion: '525079391',
    mutable,
  }),
};

export const INNER_LST_STATE_ID = {
  [SHARED_OBJECTS.WWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xa9c43ae543b29a20467cdc3e933c3b7651089d56b1d99d6d4d863ae09fdc5624'
    ),
  [SHARED_OBJECTS.PWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0x857e3c653b517cf99820e7ee680de933799807eb780ca62344a60940311959a0'
    ),
  [SHARED_OBJECTS.BREAD_WAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0x663c44caf0a40f148b9ba76e31d612dcaa138b3f2868990bcd48e89f183fdd44'
    ),
  [SHARED_OBJECTS.NWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xf29b73f0f22d2c7fc72c1fe9858859bc0268c3bc5742c4181d4bc2162b6f3f4a'
    ),
  [SHARED_OBJECTS.UP_WAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xb87a1e9ff830d6855d5197d1946640b67c198378958fece54c4b29f780220eca'
    ),
  [SHARED_OBJECTS.MWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0x92e5a5312dbd299c7284788e60eca29e5241406ce6b35a2588d94d903a401a40'
    ),
  [SHARED_OBJECTS.TR_WAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xba9ef1033d861252f6254752a2ba6e495ca08702dd2bc524a6ef1a76f8ac5a54'
    ),
};

export const INNER_LST_TREASURY_CAP = {
  [SHARED_OBJECTS.WWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0x423ec7efb16a74e6885385a49df3436758fa9e79302a9f0de9485b8874cf2aaf'
    ),
  [SHARED_OBJECTS.PWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0x2f30428b1ae24b8708b59c0083881c8ebf8149a5932323e6f1f25d59a3d7a53c'
    ),
  [SHARED_OBJECTS.BREAD_WAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xc4afc289ea27490d5e59e379c875890af37041f9bdf9651d1c213a097c328216'
    ),
  [SHARED_OBJECTS.NWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xbd3194d22731232d22f484bb44a9d02880bef12f2ab1fd5abe802ea9a08e69a5'
    ),
  [SHARED_OBJECTS.UP_WAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xa8315b6458e455121e0d8c7a656e31e1c9ccb9433c166289a3c93904d2046cdc'
    ),
  [SHARED_OBJECTS.MWAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0xe1b3079eea6e85fba6b013d101351f9c6397e5a56b8fe48624de5aa71a796933'
    ),
  [SHARED_OBJECTS.TR_WAL_STAKING({ mutable: false }).objectId]:
    normalizeSuiObjectId(
      '0x390082df42428e33c5c4a3a9ec9a33567f8748e2cb5a6c4953c7a884f032e2b5'
    ),
};

export const TYPES = {
  WWAL: `${PACKAGES.WWAL.original}::wwal::WWAL`,
  BLIZZARD: `${PACKAGES.BLIZZARD.original}::blizzard::BLIZZARD`,
  WAL: `${PACKAGES.WAL.original}::wal::WAL`,
  STAKED_WAL: `${PACKAGES.WALRUS.original}::staked_wal::StakedWal`,
  BLIZZARD_STAKE_NFT: `${PACKAGES.BLIZZARD.original}::blizzard_stake_nft::BlizzardStakeNFT`,
  UP_WAL: `${PACKAGES.UP_WAL.original}::up_wal::UP_WAL`,
  BREAD_WAL: `${PACKAGES.BREAD_WAL.original}::bread_wal::BREAD_WAL`,
  NWAL: `${PACKAGES.NWAL.original}::nwal::NWAL`,
  PWAL: `${PACKAGES.PWAL.original}::pwal::PWAL`,
  MWAL: `${PACKAGES.MWAL.original}::mwal::MWAL`,
  TR_WAL: `${PACKAGES.TR_WAL.original}::tr_wal::TR_WAL`,
} as const;
