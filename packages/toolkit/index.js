#!/usr/bin/env node

const process = require('process');

const docker = require('./cmd/docker');


const {Command} = require('commander');
const {resolveConfig} = require("./src/config");
const {deploy, update, getImageHash} = require("./src/contract");
const {info} = require("./src/log");
const {cache} = require("./src/cache");
const {context} = require("./src/context");

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
    const config = resolveConfig();
    const imageName = config.image + ':' + (config.version ? config.version : 'latest');

    try {
      await docker.run('build', ['.'], {
        '-t': imageName,
      })

      const imageHash = await getImageHash(imageName);

      if (!config.networks.hasOwnProperty(options.network)) {
        throw new Error('Network config not founded');
      }

      const networkConfig = {
        ...config.networks[options.network]
      }

      const nodeConfig = {
        ...MAINNET_CONFIG,
        nodeAddress: networkConfig.nodeAddress
      }

      context({
        network: options.network,
        networkConfig: networkConfig,
        nodeConfig: nodeConfig
      });

      await docker.run(['image', 'tag'], [imageName, `${networkConfig.registry}/${imageName}`], {});
      await docker.run(['image', 'push'], [`${networkConfig.registry}/${imageName}`], {});

      const Tx = await deploy(nodeConfig,
        {
          seed: networkConfig.seed,
          imageName,
          imageHash,
          name: config.name,
          params: networkConfig.params.init()
        });

      cache().addDeployedImage(imageHash,  options.network, Tx.id, Date.now());
      cache().persist();

      info('Successfully deployed to network');
    } catch (e) {
      console.error(e);
    }
  })


program
  .command('update')
  .option('-n, --network <char>', 'Network', 'testnet')
  .description('Update contract to network')
  .action(async (options) => {
    const config = resolveConfig();
    const dbCache = cache();

    if (!config.networks.hasOwnProperty(options.network)) {
      throw new Error('Network config not founded');
    }

    const networkConfig = {
      ...config.networks[options.network]
    }

    const nodeConfig = {
      ...MAINNET_CONFIG,
      nodeAddress: networkConfig.nodeAddress
    }

    context({
      network: options.network,
      networkConfig: networkConfig,
      nodeConfig: nodeConfig
    });

    const imageName = config.image + ':' + (config.version ? config.version : 'latest');

    await docker.run('build', ['.'], {
      '-t': imageName,
    })

    const imageHash = await getImageHash(imageName);

    await docker.run(['image', 'tag'], [imageName, `${networkConfig.registry}/${imageName}`], {});
    await docker.run(['image', 'push'], [`${networkConfig.registry}/${imageName}`], {});

    const lastDeploy = dbCache.getLastContractVersion();

    if (!lastDeploy) {
      throw new Error('Contract was not deployed from this machine');
    }

    const Tx = await update(nodeConfig,
      {
        seed: networkConfig.seed,
        image: imageName,
        imageHash,
        contractId: lastDeploy.contractId
      }
    )

    dbCache.updateImage(Tx.contractId, Tx.imageHash, Tx.id);
    dbCache.persist();

    info('Contract successfully updated');
  });

program
  .command('compile')
  .option('-n, --network <char>', 'Network', 'testnet')
  .description('Compile contract')


program.parse(process.argv);