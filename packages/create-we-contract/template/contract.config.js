module.exports = {
  image: "contract-image=name",
  name: 'Contract Name',
  version: '1.2.3', // default=latest
  networks: {
    testnet: {
      seed: 'admin seed phrase',
    },

    mainnet: {
      seed: 'mainnet env seed'
    },
    sandbox: {
      registry: 'localhost:5000',
      nodeAddress: 'http://localhost:6862',
      seed: 'admin seed phrase',

      params: {
        init: () => ({
            test: 'string'
        })
      }
    }
  }
}