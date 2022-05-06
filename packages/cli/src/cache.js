const path = require("path");
const fs = require('fs');
const {ctx} = require("./context");
const {resolveConfig} = require("./config");

const cacheRoot = path.join(process.cwd(), '.we-cache');
const dbPath = path.join(cacheRoot, 'db.json');

function initCache() {
  console.log(ctx);
  const isCacheRootExists = fs.existsSync(cacheRoot);
  const isDBExists = fs.existsSync(dbPath);

  if (!isCacheRootExists) {
    fs.mkdirSync(cacheRoot);
  }

  if (!isDBExists) {
    const cfg = resolveConfig()

    const cache = {
      name: cfg.name,
      image: cfg.image,
      deployed: []
    };

    fs.writeFileSync(dbPath, JSON.stringify(cache, null, 2));
  }

  const dbFile = fs.readFileSync(dbPath);

  return JSON.parse(dbFile);
}

function cache() {
  const db = initCache();

  const addDeployedImage = (hash, network, contractId, timestamp) => {
    db.deployed.push({
      hash, network, contractId, timestamp, updates: []
    });
  }

  const updateImage = (contractId, hash, txId) => {
    const contractIndex = db.deployed.findIndex(t => t.contractId);

    db.deployed.splice(contractIndex, 1, {
      ...db.deployed[contractIndex],
      updates: [
        ...db.deployed[contractIndex].updates,
        {
          hash, txId
        }
      ]
    });
  }

  return {
    getLastContractVersion: () => {
      const [last] = db.deployed
        .filter(c => ctx.network === c.network)
        .sort((p, c) => p.timestamp < c.timestamp);

      return last;
    },
    addDeployedImage,
    updateImage,
    prune: () => {
      db.deployed = [];
    },

    persist: () => {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
  }
}


module.exports = {
  cache
}