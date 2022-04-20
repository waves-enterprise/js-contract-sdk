const path = require("path");

function resolveConfig() {
  const configPath = path.join(process.cwd(), 'contract.config.js')

  return require(configPath);
}


module.exports = {
  resolveConfig
}