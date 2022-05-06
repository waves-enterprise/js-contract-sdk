const fetch = require("node-fetch");

const {ctx} = require("./context");

const POLL_TTL = 7000;
const MAX_RETRIES = 15;

async function observe(method) {
  const {nodeConfig} = ctx;

  if (!nodeConfig) {
    throw new Error('node config was not provided');
  }

  let retries = 0;
  let lastError;

  const f = async () => {
    if (++retries > MAX_RETRIES) {

      throw new Error(lastError.message || 'Unhandled error');
    }

    const res = await fetch(`${nodeConfig.nodeAddress}${method}`);
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

async function contractStatus(contractId) {
  return observe(`/contracts/status/${contractId}`);
}

async function contractInfo(contractId) {
  return observe(`/contracts/info/${contractId}`);
}

function sleep(tm) {
  return new Promise((resolve, reject) => {

    setTimeout(resolve, tm);
  })
}

module.exports = {
  contractStatus,
  contractInfo,
}