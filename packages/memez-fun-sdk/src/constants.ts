import { Network } from '@interest-protocol/sui-core-sdk';
import {
  normalizeStructTag,
  normalizeSuiAddress,
  normalizeSuiObjectId,
  SUI_TYPE_ARG,
} from '@mysten/sui/utils';

export enum Modules {
  FUN = 'memez_fun',
  ACL = 'access_control',
  PUMP = 'memez_pump',
  CONFIG = 'memez_config',
  VERSION = 'memez_allowed_versions',
  METADATA = 'memez_metadata',
  STABLE = 'memez_stable',
  PUMP_CONFIG = 'memez_pump_config',
  STABLE_CONFIG = 'memez_stable_config',
}

export enum Treasuries {
  RECRD = '0xe551156357c05fb323f188087ceb34b723aa82aa464541ac791b8a72594fbd4c',
  MEMEZ = '0x5b2aec3521419fe055b6753b15cbad845ec1dca852b75ad0b13b569f2329f82d',
  XPUMP = '0x881d835c410f33a1decd8067ce04f6c2ec63eaca196235386b44d315c2152797',
}

export enum Progress {
  Bonding = 'Bonding',
  Migrating = 'Migrating',
  Migrated = 'Migrated',
}

export const PACKAGES = {
  [Network.TESTNET]: {
    MEMEZ_FUN: {
      original: normalizeSuiAddress(
        '0xcad2e05e9771c6b1aad35d4f3df42094d5d49effc2a839e34f37ae31dc373fe7'
      ),
      latest: normalizeSuiAddress(
        '0xcad2e05e9771c6b1aad35d4f3df42094d5d49effc2a839e34f37ae31dc373fe7'
      ),
    },
    MEMEZ: {
      original: normalizeSuiAddress(
        '0x17209c541f1a372b811a42eaf95e62cd1eb46127e438f052432bd1c2318bc1c9'
      ),
      latest: normalizeSuiAddress(
        '0x17209c541f1a372b811a42eaf95e62cd1eb46127e438f052432bd1c2318bc1c9'
      ),
    },
    VESTING: {
      original: normalizeSuiAddress(
        '0xbc838799ce0c571fddb5c650adae05ed141070501558743f2f28d2d3fbede8d6'
      ),
      latest: normalizeSuiAddress(
        '0xbc838799ce0c571fddb5c650adae05ed141070501558743f2f28d2d3fbede8d6'
      ),
    },
    TEST_MEMEZ_MIGRATOR: {
      original: normalizeSuiAddress(
        '0x1e15037693e28af09771953ec8179d104fff7a225e5a5d1a65034a3636451026'
      ),
      latest: normalizeSuiAddress(
        '0x1e15037693e28af09771953ec8179d104fff7a225e5a5d1a65034a3636451026'
      ),
    },
    MEMEZ_WITNESS: {
      original: normalizeSuiAddress(
        '0x6083aeb2d22514d0e849fdde75b60c7d0f857facefb3b2d7d2e975b78d8a0c75'
      ),
      latest: normalizeSuiAddress(
        '0x6083aeb2d22514d0e849fdde75b60c7d0f857facefb3b2d7d2e975b78d8a0c75'
      ),
    },
    INTEREST_ACL: {
      original: normalizeSuiAddress(
        '0x32ffaa298a6d6528864bf2b32acfcb7976a95e26dcc24e40e2535c0551b9d68a'
      ),
      latest: normalizeSuiAddress(
        '0x32ffaa298a6d6528864bf2b32acfcb7976a95e26dcc24e40e2535c0551b9d68a'
      ),
    },
    XPUMP_MIGRATOR: {
      original: normalizeSuiAddress('0x0'),
      latest: normalizeSuiAddress('0x0'),
    },
  },
  [Network.MAINNET]: {
    MEMEZ_FUN: {
      original: normalizeSuiAddress(
        '0x77ad40b0364cc5d95406f55d7353bbccaf4284bce12b3ce4bf66de28ebaabc6d'
      ),
      latest: normalizeSuiAddress(
        '0x77ad40b0364cc5d95406f55d7353bbccaf4284bce12b3ce4bf66de28ebaabc6d'
      ),
    },
    MEMEZ: {
      original: normalizeSuiAddress(
        '0x6101835e1df12852440c3ad3f079130e31702fe201eb1e3b77d141a0c6a58539'
      ),
      latest: normalizeSuiAddress(
        '0x6101835e1df12852440c3ad3f079130e31702fe201eb1e3b77d141a0c6a58539'
      ),
    },
    VESTING: {
      original: normalizeSuiAddress(
        '0x1a184ecf7d0652f8f1285a3b0b2e644bf86ae1742317fcdaa9b11a7f3a30bd70'
      ),
      latest: normalizeSuiAddress(
        '0x1a184ecf7d0652f8f1285a3b0b2e644bf86ae1742317fcdaa9b11a7f3a30bd70'
      ),
    },
    TEST_MEMEZ_MIGRATOR: {
      original: normalizeSuiAddress(
        '0x4078fe9f8e60191b1ec85d4092b4ec070736dd7c4a3b0c69b1f121c4c6aee910'
      ),
      latest: normalizeSuiAddress(
        '0x4078fe9f8e60191b1ec85d4092b4ec070736dd7c4a3b0c69b1f121c4c6aee910'
      ),
    },
    MEMEZ_WITNESS: {
      original: normalizeSuiAddress(
        '0x6e38cc853e404376b1dc969178aee2c81799cf23af7171e74e492f6786db1cbe'
      ),
      latest: normalizeSuiAddress(
        '0x6e38cc853e404376b1dc969178aee2c81799cf23af7171e74e492f6786db1cbe'
      ),
    },
    INTEREST_ACL: {
      original: normalizeSuiAddress(
        '0xb877fe150db8e9af55c399b4e49ba8afe658bd05317cb378c940344851125e9a'
      ),
      latest: normalizeSuiAddress(
        '0xb877fe150db8e9af55c399b4e49ba8afe658bd05317cb378c940344851125e9a'
      ),
    },
    XPUMP_MIGRATOR: {
      original: normalizeSuiAddress(
        '0x3b09948e386bd895c627aafebdeb0560854125a0672ade7a64495447ec5701b3'
      ),
      latest: normalizeSuiAddress(
        '0x66f5cbed78925decc17cb6ed737ed40b14cc5ed2c450e6a806889fa7f5be95fe'
      ),
    },
  },
} as const;

export const OWNED_OBJECTS = {
  [Network.TESTNET]: {
    MEMEZ_SUPER_ADMIN: normalizeSuiObjectId(
      '0x2c1dbc3cd98c3deb1ce5aba8000564211cb8a391bb7707e642baeb08bd52207f'
    ),
    VESTING_UPGRADE_CAP: normalizeSuiObjectId(
      '0x91d2da1c0929db3e040d483fbbf5f169ce9b964b07ce3c084efbfcccf74220ec'
    ),
    MEMEZ_FUN_UPGRADE_CAP: normalizeSuiObjectId(
      '0xe4e9fe91072969688cc1408acd4551ac2f1ad3fbe2f3df84f648c051e1caf70d'
    ),
    TEST_MEMEZ_MIGRATOR_UPGRADE_CAP: normalizeSuiObjectId(
      '0xdd88875fb9a59dc8a82787cdbbe1371ae01275c4f5364990384eb2ff6c7e552f'
    ),
    ADMIN: normalizeSuiObjectId(
      '0xa47aca8f255e3b88348a768ff0f9031a01bd49eb57592eb72b333327176aaa26'
    ),
    MEMEZ_PUBLISHER: normalizeSuiObjectId(
      '0x97167172ddc539921db1c7443ce30ba2bc5969c3403007e3147fdd3fbe01d54d'
    ),
    MEMEZ_UPGRADE_CAP: normalizeSuiObjectId(
      '0x43461df272d965d153d50789af15adc03359433e54eb522d0e484630789c16ee'
    ),
    XPUMP_MIGRATOR_UPGRADE_CAP: normalizeSuiObjectId('0x0'),
    XPUMP_MIGRATOR_ADMIN: normalizeSuiObjectId('0x0'),
  },
  [Network.MAINNET]: {
    MEMEZ_SUPER_ADMIN: normalizeSuiObjectId(
      '0xa1c033361bca6aa5d2c0f24d468d7c165f4cefabe7e25ba9749b5481b095aeb0'
    ),
    VESTING_UPGRADE_CAP: normalizeSuiObjectId(
      '0x0c1c3cf5dea0a302153192fac4d0767c0fa8f21b7724f85290c148c8f1187896'
    ),
    MEMEZ_FUN_UPGRADE_CAP: normalizeSuiObjectId(
      '0xbd5609736c4e1932d78d278a0082012d4355353316f34b2340d0d3dcc5926e8f'
    ),
    TEST_MEMEZ_MIGRATOR_UPGRADE_CAP: normalizeSuiObjectId(
      '0x291d1a741c839a34ed1da1b9b84205388f847076147fa869c8a5cfd5c6949df5'
    ),
    ADMIN: normalizeSuiObjectId(
      '0x3506cac2a7992d04af2521692213b3982e17111d6b2ae00bd9454e335e50c0af'
    ),
    MEMEZ_PUBLISHER: normalizeSuiObjectId(
      '0x68fe5e2a135799de5c53ce3cb82902b187217e81b0e24e9f0f030371f555f872'
    ),
    MEMEZ_UPGRADE_CAP: normalizeSuiObjectId(
      '0xc9f835866b57147f8b7e1f847e2a2a25f29315c200c89cdc4e34f51f5c1f85d6'
    ),
    XPUMP_MIGRATOR_UPGRADE_CAP: normalizeSuiObjectId(
      '0xe8e05b334c8222157e620fc817baf735dbad2e8168be9290a139d022e2a61faa'
    ),
    XPUMP_MIGRATOR_ADMIN: normalizeSuiObjectId(
      '0x27d8adab56f8b1296c108f88b17ff4a8c7f603a1a2ce3f0daeb4aab3ba528b22'
    ),
  },
} as const;

export const SHARED_OBJECTS = {
  [Network.TESTNET]: {
    ACL: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0xc8502b2e13ce57165218abaacd36850c7ea70a5ef4c0b80053eb0f6aaf1d338e'
      ),
      initialSharedVersion: '395367236',
      mutable,
    }),
    VERSION: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0x4662e671861a4cb72ee0fe03193e3dd62645465f7cc61ce13422c8384bc8af46'
      ),
      initialSharedVersion: '395367301',
      mutable,
    }),
    CONFIG: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0x0c8812c7ab6ae0a900a015c7db0048b20dad072c10faaef4759610a7ada97a73'
      ),
      initialSharedVersion: '395367301',
      mutable,
    }),
    XPUMP_MIGRATOR_CONFIG: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId('0x0'),
      initialSharedVersion: '0',
      mutable,
    }),
  },
  [Network.MAINNET]: {
    ACL: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0x091bd217c6030076a8a97673e3b9f74e0f48bc3035dcb5d5daaf50a8a2d40b7f'
      ),
      initialSharedVersion: '549909164',
      mutable,
    }),
    VERSION: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0xb428c542bd80a6f1f2eb500b7135d7ab1b9cdc27e465b1f486fdb5b000951491'
      ),
      initialSharedVersion: '596402896',
      mutable,
    }),
    CONFIG: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0x55f27db9b8a42da8b5802be03018123a80bb270349e7034a7d1ba514f77c2c89'
      ),
      initialSharedVersion: '596402896',
      mutable,
    }),
    XPUMP_MIGRATOR_CONFIG: ({ mutable }: { mutable: boolean }) => ({
      objectId: normalizeSuiObjectId(
        '0x6d6300fc47a3fff33da0a30a2284fc73d2942af5b424203a7324e97cf8746022'
      ),
      initialSharedVersion: '596402900',
      mutable,
    }),
  },
} as const;

export const MIGRATOR_WITNESSES = {
  [Network.TESTNET]: {
    TEST: `${PACKAGES[Network.TESTNET].TEST_MEMEZ_MIGRATOR.original}::dummy::Witness`,
    XPUMP: `${PACKAGES[Network.TESTNET].XPUMP_MIGRATOR.original}::xpump_migrator::Witness`,
  },
  [Network.MAINNET]: {
    TEST: `${PACKAGES[Network.MAINNET].TEST_MEMEZ_MIGRATOR.original}::dummy::Witness`,
    XPUMP: `${PACKAGES[Network.MAINNET].XPUMP_MIGRATOR.original}::xpump_migrator::Witness`,
  },
} as const;

export const TYPES = {
  [Network.TESTNET]: {
    MEMEZ_OTW: `${PACKAGES[Network.TESTNET].MEMEZ.original}::memez::MEMEZ`,
    MEMEZ_FEE: `${PACKAGES[Network.TESTNET].MEMEZ_FUN.original}::memez_fees::MemezFees`,
  },
  [Network.MAINNET]: {
    MEMEZ_OTW: `${PACKAGES[Network.MAINNET].MEMEZ.original}::memez::MEMEZ`,
    MEMEZ_FEE: `${PACKAGES[Network.MAINNET].MEMEZ_FUN.original}::memez_fees::MemezFees`,
  },
} as const;

export const CONFIG_KEYS = {
  [Network.TESTNET]: {
    RECRD: `${PACKAGES[Network.TESTNET].MEMEZ_WITNESS.original}::memez_witness::Recrd`,
    NEXA: `${PACKAGES[Network.TESTNET].MEMEZ_WITNESS.original}::memez_witness::Nexa`,
    MEMEZ: `${PACKAGES[Network.TESTNET].MEMEZ_WITNESS.original}::memez_witness::Memez`,
    XPUMP:
      '0x9877fd4cade7740a391e4bb25c81bbe4763a905dd3f26608e9d53e9cd5f14c06::xpump::MemezConfigKey',
  },
  [Network.MAINNET]: {
    RECRD: `${PACKAGES[Network.MAINNET].MEMEZ_WITNESS.original}::memez_witness::Recrd`,
    NEXA: `${PACKAGES[Network.MAINNET].MEMEZ_WITNESS.original}::memez_witness::Nexa`,
    MEMEZ: `${PACKAGES[Network.MAINNET].MEMEZ_WITNESS.original}::memez_witness::Memez`,
    XPUMP:
      '0x5afcb4c691bd3af2eb5de4c416b2ed501e843e81209f83ce6928bc3a10d0205c::xpump::ConfigKey',
  },
} as const;

export const MAX_BPS = 10_000n;

export const CONFIG_QUOTE_COIN_TYPES = {
  [Network.TESTNET]: {
    [CONFIG_KEYS[Network.TESTNET].RECRD]: normalizeStructTag(SUI_TYPE_ARG),
    [CONFIG_KEYS[Network.TESTNET].NEXA]: normalizeStructTag(SUI_TYPE_ARG),
    [CONFIG_KEYS[Network.TESTNET].MEMEZ]: normalizeStructTag(SUI_TYPE_ARG),
    [CONFIG_KEYS[Network.TESTNET].XPUMP]: normalizeStructTag(SUI_TYPE_ARG),
  },
  [Network.MAINNET]: {
    [CONFIG_KEYS[Network.MAINNET].RECRD]: normalizeStructTag(SUI_TYPE_ARG),
    [CONFIG_KEYS[Network.MAINNET].NEXA]: normalizeStructTag(SUI_TYPE_ARG),
    [CONFIG_KEYS[Network.MAINNET].MEMEZ]: normalizeStructTag(SUI_TYPE_ARG),
    [CONFIG_KEYS[Network.MAINNET].XPUMP]: normalizeStructTag(SUI_TYPE_ARG),
  },
} as const;

export const CETUS_GLOBAL_CONFIG = {
  objectId: normalizeSuiObjectId(
    '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f'
  ),
  initialSharedVersion: '1574190',
};

export const CETUS_POOLS = {
  objectId: normalizeSuiObjectId(
    '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0'
  ),
  initialSharedVersion: '1574190',
};

export const CETUS_BURNER_MANAGER =
  '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845';

export const BLUEFIN_CONFIG = {
  objectId: normalizeSuiObjectId(
    '0x03db251ba509a8d5d8777b6338836082335d93eecbdd09a11e190a1cff51c352'
  ),
  initialSharedVersion: '406496849',
};
