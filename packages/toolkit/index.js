#!/usr/bin/env node

const process = require('process');

const docker = require('./cmd/docker');


const {Command} = require('commander');
const {resolveConfig} = require("./src/config");
const {deploy} = require("./src/deploy");
const {info} = require("./src/log");

const MAINNET_CONFIG = {
  //TOOD
}

const TESTNET_CONFIG = {
  //TOOD
}

const SANDBOX_CONFIG = {
  registry: 'localhost:5000',
  nodeUrl: 'http://localhost:6862',
  seed: 'admin seed phrase'
}


const program = new Command();

program
  .name('we-contract-toolkit')
  .description('Command line toolkit for deploying smart contracts')
  .version('0.1.0');


program
  .command('deploy')
  .option('-n, --network <char>', 'Network', 'testnet')
  .description('Deploys contract to network')
  .action(async (options) => {
    console.log(options)

    const config = resolveConfig();

    const imageName = config.image + ':' + (config.version ? config.version : 'latest');

    try {
      await docker.run('build', ['.'], {
        '-t': imageName,
      })

      const inspectCommand = await docker.run('inspect', [imageName], {})

      const imageHash = JSON.parse(inspectCommand.out)[0].Id.replace('sha256:', '')

      if (!config.networks.hasOwnProperty(options.network)) {
        throw new Error('Network config not founded');
      }

      const networkConfig = {
        ...config.networks[options.network]
      }

      await docker.run(['image', 'tag'], [imageName, `${networkConfig.registry}/${imageName}`], {});
      await docker.run(['image', 'push'], [`${networkConfig.registry}/${imageName}`], {});

      await deploy({
          ...MAINNET_CONFIG,
          nodeAddress: networkConfig.nodeAddress
        },
        {
          seed: networkConfig.seed,
          imageName,
          imageHash,
          name: config.name,
          params: networkConfig.params.init()
        })

      info('Successfully deployed to network');
    } catch (e) {
      console.error(e.err);
    }
  })


program
  .command('compile')
  .option('-n, --network <char>', 'Network', 'testnet')
  .description('Compile contract')


program.parse(process.argv);