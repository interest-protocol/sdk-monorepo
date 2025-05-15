import chalk from 'chalk';

// Define your log levels
const logInfo = (msg: any) => console.log(chalk.blue(`ℹ️ INFO: ${msg}`));
const logSuccess = (msg: any) => console.log(chalk.green(`✅ SUCCESS: ${msg}`));
const logWarning = (msg: any) =>
  console.log(chalk.yellow(`⚠️ WARNING: ${msg}`));
const logError = (msg: any) => console.log(chalk.red(`❌ ERROR: ${msg}`));

export { logError, logInfo, logSuccess, logWarning };
