const fetch = require('node-fetch')
const docker = require("../cmd/docker");

const {We} = require("@wavesenterprise/sdk");
const {paramType} = require("./utils");
const {info} = require("./log");
const {contractStatus} = require("./tx-observer");

async function deploy(nodeConfig, {seed, imageName, imageHash, name, params}) {
  const {chainId, minimumFee} = await (await fetch(`${nodeConfig.nodeAddress}/node/config`)).json();

  const WE = new We()

  const signer = WE.Seed.fromExistingPhrase(seed)

  const txBody = {
    image: imageName,
    imageHash: imageHash,
    contractName: name,
    timestamp: Date.now(),
    params: transformParams(params)
  };

  const tx = WE.API.Transactions.CreateContract.V2(txBody);

  const Tx = await tx.broadcast(signer.keyPair);

  info(`ContractId "${Tx.id}"`);

  await contractStatus(Tx.id);

  return Tx;
}

async function update(nodeConfig, {seed, image, imageHash, contractId}) {
  const nodeApi = await getNodeApi(nodeConfig);

  const signer = nodeApi.Seed.fromExistingPhrase(seed)
  const tx = nodeApi.API.Transactions.UpdateContract.V2({
    image,
    imageHash,
    contractId,
    timestamp: Date.now()
  })

  const Tx = await tx.broadcast(signer.keyPair);

  info(`Contract updated at address ${contractId}`);

  return Tx;
}


async function getImageHash(imageName) {
  const inspectCommand = await docker.run('inspect', [imageName], {})

  const imageHash = JSON.parse(inspectCommand.out)[0].Id.replace('sha256:', '')

  return imageHash;
}

async function getNodeApi(nodeConfig) {
  const {chainId, minimumFee} = await (await fetch(`${nodeConfig.nodeAddress}/node/config`)).json();

  return create({
    initialConfiguration: {
      ...MAINNET_CONFIG,
      ...nodeConfig,
      networkByte: chainId.charCodeAt(0),
      minimumFee,
    },
    fetchInstance: fetch
  });
}

function transformParams(params) {
  return Object.entries(params).map(([key, value]) => {
    return {
      type: paramType(value),
      value: value,
      key: key
    }
  });
}

module.exports = {
  deploy,
  update,
  getImageHash
}