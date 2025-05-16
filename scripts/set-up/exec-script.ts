import { exec } from 'child_process';
import { config } from 'dotenv';
import invariant from 'tiny-invariant';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

config();

invariant(process.env.KEY, 'Private key missing');

(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option('network', {
      alias: 'n',
      type: 'string',
      description: 'Specify the network',
    })
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'Specify the path to the script to run',
    })
    .parse();

  const { network, path } = argv;

  invariant(path, 'Path is required');

  process.env.WEB_3_NETWORK = network;

  const command = `tsx ./scripts/${path}.ts`;

  exec(command, (error, stdout) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.warn(stdout);
  });
})();
