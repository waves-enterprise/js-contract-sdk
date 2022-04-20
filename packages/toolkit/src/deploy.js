const fetch = require('node-fetch')

const {create, MAINNET_CONFIG} = require("@wavesenterprise/js-sdk");
const {paramType} = require("./utils");
const {info} = require("./log");

const POLL_TTL = 5000;
const MAX_RETRIES = 10;

async function deploy(nodeConfig, {seed, imageName, imageHash, name, params}) {
  const {chainId, minimumFee} = await (await fetch(`${nodeConfig.nodeAddress}/node/config`)).json();

  const WE = create({
    initialConfiguration: {
      ...MAINNET_CONFIG,
      ...nodeConfig,
      networkByte: chainId.charCodeAt(0),
      minimumFee,
    },
    fetchInstance: fetch
  });

  const signer = WE.Seed.fromExistingPhrase(seed)

  const txBody = {
    image: imageName,
    imageHash: imageHash,
    contractName: name,
    timestamp: Date.now(),
    params: transformParams(params)
  };

  const tx = WE.API.Transactions.CreateContract.V2(txBody)
  await tx.broadcast(signer.keyPair);
  const txId = await tx.getId(signer.keyPair.publicKey);

  info('TxId=', txId);

  const fetchInfo = async () => {
    let retries = 0;
    let lastError;

    const f = async () => {
      if (++retries > MAX_RETRIES) {

        throw new Error(lastError.message || 'Unhandled error');
      }

      const res = await fetch(`${nodeConfig.nodeAddress}/contracts/status/${txId}`);
      const resp = await res.json();

      if (res.status !== 200) {
        lastError = resp;

        await sleep(POLL_TTL);
        return f();
      } else {
        return resp;
      }
    }

    const resp = await f();

    const [lastMessage] = resp.slice(-1);

    if (lastMessage.status === 'Failure') {
      throw new Error(lastMessage.message);
    }

    return {
      message: lastMessage.message,
      txId: lastMessage.txId
    }
  }

  return fetchInfo()
}

function sleep(tm) {
  return new Promise((resolve, reject) => {

    setTimeout(resolve, tm);
  })
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
  deploy
}