const os = require('os')
const {exec} = require('child_process');
const {create, MAINNET_CONFIG} = require('@wavesenterprise/js-sdk');
const {networkInterfaces} = require('os');


const fetch = async (url, options = {}) => {
  const headers = {};
  return import('node-fetch').then(f => {


    return f.default(url, {...options, headers: {...headers, 'x-api-key': 'we', 'Content-Type': 'application/json'}})
  });
};


const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

const hostIp = results['vEthernet (Default Switch)'][0]

const imageName = 'test0-contract:1.1.3'

const execute = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};


const buildDockerImage = async () => {
  await execute(`docker build --build-arg HOST_NETWORK=${hostIp} -t ${imageName} .`);
  const inspectResult = await execute(`docker inspect ${imageName}`);
  const inspectData = JSON.parse(inspectResult)[0];
  const imageHash = inspectData.Id.replace('sha256:', '');

  console.log(imageHash)
  return imageHash
}

const pushDockerRegistry = async () => {
  await execute(`docker image tag ${imageName} localhost:5000/${imageName}`)
  await execute(`docker image push localhost:5000/${imageName}`)
}

const nodeAddress = 'http://localhost:6862';
const adminSeedPhrase = 'admin seed phrase';

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
  const imageHash = await buildDockerImage()

  await pushDockerRegistry();

  const we = await createWavesApi()

  const adminSeed = we.Seed.fromExistingPhrase(adminSeedPhrase);

  const txBody = {
    image: imageName,
    imageHash: imageHash,
    contractName: 'Test contract [v0.0.1]',
    timestamp: Date.now(),
    params: [
      {
        type : 'string',
        value : 'data',
        key : 'action'
      },
      {
        type : 'integer',
        value : 3,
        key : 'number'
      },
      {
        type : 'boolean',
        value : true,
        key : 'isPositive'
      },
      {
        type : 'binary',
        value : 'base64:daaa',
        key : 'code'
      }

    ],
    // sender: adminSeed.keyPair.publicKey,
    // password: '',
  }

  const tx = we.API.Transactions.CreateContract.V2(txBody)

 const obj =  await tx.broadcast(adminSeed.keyPair);


  console.log('obj =', obj)
  const id = await tx.getId(adminSeed.keyPair.publicKey)

  console.log(id);

  return id
}

main();