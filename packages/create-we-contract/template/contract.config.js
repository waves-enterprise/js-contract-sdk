module.exports = {
  image: "contract-image",
  name: 'Your Contract Name',
  version: '0.0.1', // default=latest
  networks: {
    testnet: {
      seed: '#paste your seed phrase here',
    },

    mainnet: {
      seed: '#paste your seed phrase here'
    },
    sandbox: {
      registry: 'localhost:5000',
      nodeAddress: 'http://localhost:6862',
      seed: '#paste your seed phrase here',
      params: {
        init: () => ({
            param: '${value}'
        })
      }
    }
  }
}