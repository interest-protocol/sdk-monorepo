import { normalizeSuiAddress, SUI_FRAMEWORK_ADDRESS } from '@mysten/sui/utils';
import invariant from 'tiny-invariant';
import { VORTEX_PACKAGE_ID } from '../constants';

interface MoveCall {
  package: string;
  module: string;
  function: string;
  typeArguments: string[];
  arguments: object[];
}

interface ExpectedCommand {
  MoveCall?: {
    package: string;
    module: string;
    function: string;
    arguments: object[];
  };
  MakeMoveVec?: {
    elements: object[];
  };
  TransferObjects?: {
    objects: object[];
    address: object;
  };
}

const EXPECTED_DEPOSIT_WITH_ACCOUNT_COMMANDS: ExpectedCommand[] = [
  {
    MoveCall: {
      package: VORTEX_PACKAGE_ID,
      module: 'vortex_ext_data',
      function: 'new',
      arguments: [
        { Input: 0 },
        { Input: 1 },
        { Input: 2 },
        { Input: 3 },
        { Input: 4 },
        { Input: 5 },
      ],
    },
  },
  {
    MoveCall: {
      package: VORTEX_PACKAGE_ID,
      module: 'vortex_proof',
      function: 'new',
      arguments: [
        { Input: 6 },
        { Input: 7 },
        { Input: 8 },
        { Input: 9 },
        { Input: 10 },
        { Input: 11 },
        { Input: 12 },
        { Input: 13 },
      ],
    },
  },
  {
    MakeMoveVec: {
      elements: [{ Input: 16 }],
    },
  },
  {
    MoveCall: {
      package: VORTEX_PACKAGE_ID,
      module: 'vortex',
      function: 'transact_with_account',
      arguments: [
        { Input: 14 },
        { Input: 15 },
        { Result: 2 },
        { Result: 1 },
        { Result: 0 },
      ],
    },
  },
  {
    TransferObjects: {
      objects: [{ Result: 3 }],
      address: { Input: 17 },
    },
  },
];

const EXPECTED_WITHDRAW_COMMANDS: ExpectedCommand[] = [
  {
    MoveCall: {
      package: VORTEX_PACKAGE_ID,
      module: 'vortex_ext_data',
      function: 'new',
      arguments: [
        { Input: 0 },
        { Input: 1 },
        { Input: 2 },
        { Input: 3 },
        { Input: 4 },
        { Input: 5 },
      ],
    },
  },
  {
    MoveCall: {
      package: VORTEX_PACKAGE_ID,
      module: 'vortex_proof',
      function: 'new',
      arguments: [
        { Input: 6 },
        { Input: 7 },
        { Input: 8 },
        { Input: 9 },
        { Input: 10 },
        { Input: 11 },
        { Input: 12 },
        { Input: 13 },
      ],
    },
  },
  {
    MoveCall: {
      package: SUI_FRAMEWORK_ADDRESS,
      module: 'coin',
      function: 'zero',
      arguments: [],
    },
  },
  {
    MoveCall: {
      package: VORTEX_PACKAGE_ID,
      module: 'vortex',
      function: 'transact',
      arguments: [
        { Input: 14 },
        { Result: 2 },
        { Result: 1 },
        { Result: 0 },
      ],
    },
  },
  {
    TransferObjects: {
      objects: [{ Result: 3 }],
      address: { Input: 15 },
    },
  },
];

function validateCommands(
  commands: object[],
  expectedCommands: ExpectedCommand[]
): void {
  invariant(
    commands.length === expectedCommands.length,
    `Expected ${expectedCommands.length} commands, got ${commands.length}`
  );

  for (let i = 0; i < commands.length; i++) {
    const actual = commands[i] as Record<string, unknown>;
    const expected = expectedCommands[i]!;

    if ('MoveCall' in expected && expected.MoveCall) {
      invariant('MoveCall' in actual, `Command ${i}: Expected MoveCall`);
      const actualMoveCall = actual.MoveCall as MoveCall;
      const expectedMoveCall = expected.MoveCall;

      invariant(
        normalizeSuiAddress(actualMoveCall.package) ===
          normalizeSuiAddress(expectedMoveCall.package),
        `Command ${i}: Package mismatch. Expected ${expectedMoveCall.package}, got ${actualMoveCall.package}`
      );
      invariant(
        actualMoveCall.module === expectedMoveCall.module,
        `Command ${i}: Module mismatch. Expected ${expectedMoveCall.module}, got ${actualMoveCall.module}`
      );
      invariant(
        actualMoveCall.function === expectedMoveCall.function,
        `Command ${i}: Function mismatch. Expected ${expectedMoveCall.function}, got ${actualMoveCall.function}`
      );
      invariant(
        JSON.stringify(actualMoveCall.arguments) ===
          JSON.stringify(expectedMoveCall.arguments),
        `Command ${i}: Arguments mismatch`
      );
    } else if ('MakeMoveVec' in expected && expected.MakeMoveVec) {
      invariant('MakeMoveVec' in actual, `Command ${i}: Expected MakeMoveVec`);
      const actualMakeMoveVec = actual.MakeMoveVec as { elements: object[] };
      const expectedMakeMoveVec = expected.MakeMoveVec;

      invariant(
        JSON.stringify(actualMakeMoveVec.elements) ===
          JSON.stringify(expectedMakeMoveVec.elements),
        `Command ${i}: MakeMoveVec elements mismatch`
      );
    } else if ('TransferObjects' in expected && expected.TransferObjects) {
      invariant(
        'TransferObjects' in actual,
        `Command ${i}: Expected TransferObjects`
      );
      const actualTransfer = actual.TransferObjects as {
        objects: object[];
        address: object;
      };
      const expectedTransfer = expected.TransferObjects;

      invariant(
        JSON.stringify(actualTransfer.objects) ===
          JSON.stringify(expectedTransfer.objects),
        `Command ${i}: TransferObjects objects mismatch`
      );
      invariant(
        JSON.stringify(actualTransfer.address) ===
          JSON.stringify(expectedTransfer.address),
        `Command ${i}: TransferObjects address mismatch`
      );
    }
  }
}

export function validateDepositWithAccountCommands(commands: object[]): void {
  validateCommands(commands, EXPECTED_DEPOSIT_WITH_ACCOUNT_COMMANDS);
}

export function validateWithdrawCommands(commands: object[]): void {
  validateCommands(commands, EXPECTED_WITHDRAW_COMMANDS);
}
