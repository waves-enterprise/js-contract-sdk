
# Command line interface

```we-cli``` - tool that helps you to deploy contract to different environments.


## Deploy

Smart contracts are executed once they are deployed in the blockchain. To deploy a contract run the deploy command in WE Contract CLI:

```bash
we-cli deploy -n testnet
```
where ```testnet``` is the name of the network specified in the configuration file. For example, to deploy a contract to the sandbox network run the following command:

```bash
we-cli deploy -n sandbox
```

Make sure you setup your network credentials in ```contract.config.js```

## Update

To update image of your contract run

```bash
we-cli update
```

This command increment your contract version and update image hash on node