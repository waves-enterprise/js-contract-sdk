const {MAINNET_CONFIG, create} = require("@wavesenterprise/js-sdk");
const nodeAddress = 'http://localhost:6862';
const adminSeedPhrase = 'admin seed phrase';

const fetch = async (url, options = {}) => {
  const headers = {};
  return import('node-fetch').then(f => {
    return f.default(url, {...options, headers: {...headers, 'x-api-key': 'we', 'Content-Type': 'application/json'}})
  });
};

const createWavesApi = async () => {
  const {chainId, minimumFee} = await (await fetch(`${nodeAddress}/node/config`)).json();

  const wavesApiConfig = {
    ...MAINNET_CONFIG,
    nodeAddress,
    crypto: 'waves',
    networkByte: chainId.charCodeAt(0),
    minimumFee
  };
  const WavesApi = create({
    initialConfiguration: wavesApiConfig,
    fetchInstance: fetch
  });
  return WavesApi
}


const main = async () => {
  const we = await createWavesApi()

  const adminSeed = we.Seed.fromExistingPhrase(adminSeedPhrase);

  const txBody = {
    contractId: 'CcCbZWhWh1x2jGKu7AVNdFpkT7335owTbnRvW2FBnZVo',
    contractVersion: 1,
    timestamp: Date.now(),
    params: [
      {
        type : 'string',
        value : 'setValue',
        key : 'action'
      },
      {
        type: "string",
        value: "changed",
        key: 'changeKey'
      }


    ],
  }

  const tx = we.API.Transactions.CallContract.V2(txBody)

  const obj =  await tx.broadcast(adminSeed.keyPair);

  console.log('obj =', obj)
  const id = await tx.getId(adminSeed.keyPair.publicKey)

  console.log(id);
}


main();