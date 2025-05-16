import chalk from 'chalk';
import util from 'util';

// Force colors on if needed
chalk.level = 3; // Level 3 = 16m colors (TrueColor)

// Configurable options
const inspectOptions = {
  depth: 5,
  colors: true,
  maxArrayLength: 10,
  maxStringLength: 100,
  compact: false,
};

// Helper to ensure all args are properly formatted
const formatArgs = (...args: any[]): string => {
  // For a single argument that's an object, format it with proper indentation
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    return '\n' + util.inspect(args[0], inspectOptions);
  }

  // For multiple arguments or a single non-object
  return args
    .map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        return '\n' + util.inspect(arg, inspectOptions);
      }
      return String(arg);
    })
    .join(' ');
};

// Simple logging functions with newline after the label
export const logInfo = (...args: any[]) =>
  console.log(chalk.blue(`ℹ️ INFO:\n${formatArgs(...args)}`));

export const logSuccess = (...args: any[]) =>
  console.log(chalk.green(`✅ SUCCESS:\n${formatArgs(...args)}`));

export const logWarning = (...args: any[]) =>
  console.log(chalk.yellow(`⚠️ WARNING:\n${formatArgs(...args)}`));

export const logError = (...args: any[]) =>
  console.log(chalk.red(`❌ ERROR:\n${formatArgs(...args)}`));

export const logDebug = (...args: any[]) =>
  console.log(chalk.magenta(`🔍 DEBUG:\n${formatArgs(...args)}`));

export const logTrace = (...args: any[]) =>
  console.log(chalk.cyan(`📌 TRACE:\n${formatArgs(...args)}`));
