
# Command line interface

```we-cli``` - tool that helps you to create contract to different environments.


## Deploy

Smart contracts are executed once they are deployed in the blockchain. To create a contract run the create command in WE Contract CLI:

```bash
we-cli create -n testnet
```
where ```testnet``` is the name of the network specified in the configuration file. For example, to create a contract to the sandbox network run the following command:

```bash
we-cli create -n sandbox
```

Make sure you setup your network credentials in ```contract.config.js```

## Update

To update image of your contract run

```bash
we-cli update
```

This command increment your contract version and update image hash on node