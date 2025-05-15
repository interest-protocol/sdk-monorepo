import chalk from 'chalk';
import util from 'util';

// Define your log levels
export const logInfo = (msg: any) =>
  console.log(
    chalk.blue(`ℹ️ INFO: 
      
      ${util.inspect(msg, false, null, true)}`)
  );

export const logSuccess = (msg: any) =>
  console.log(
    chalk.green(`✅ SUCCESS: 
      
      ${util.inspect(msg, false, null, true)}`)
  );

export const logWarning = (msg: any) =>
  console.log(
    chalk.yellow(`⚠️ WARNING: 
      
      ${util.inspect(msg, false, null, true)}`)
  );

export const logError = (msg: any) =>
  console.log(
    chalk.red(`❌ ERROR: 
    
    ${util.inspect(msg, false, null, true)}`)
  );
