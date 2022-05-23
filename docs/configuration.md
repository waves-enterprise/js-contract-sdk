# Configuration

The configuration file is used to set up the image name and the contract name to be displayed in the explorer. You can also set the image tag (the ```name``` property) which will be used to send the contract to the registry in the configuration file.

Add the ```contract.config.js``` file to the root directory of your project to initialize your contract configuration.

If you scaffolded the project with the ``create-we-contract`` command as described above in the Quickstart section, the configuration is set by default.


### Default configuration

An example of default configuration is given below:

```js
module.exports = {
  image: "my-contract",
  name: 'My Contract Name',
  version: '1.0.1',
  networks: {
    /// ...
  }
}
```

### Networks configuration

In the ```networks``` section, provide specific configuration for your network:

```js
module.exports = {
  networks: {
    "sandbox": {
        seed: "#your secret seed phrase" // or get it from env process.env.MY_SECRET_SEED

        // also you can provide
        registry: 'localhost:5000',
        nodeAddress: 'http://localhost:6862',
        params: {
            init: () => ({
                paramName: 'paramValue'
            })
        }
    }
  }
}
```

* ```seed``` – if you are going to deploy a contract to the sandbox network, provide the contract initiator seed phrase;
* ```registry``` – if you used a specific Docker registry, provide the registry name;
* ```nodeAddress``` – provide specific nodeAddress to deploy to.
* ```params.init``` – to specify initialization parameters, set a function
