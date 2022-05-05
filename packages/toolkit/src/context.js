let ctx = {};

function context({network, networkConfig, nodeConfig}) {
  ctx.network = network;
  ctx.networkConfig = networkConfig;
  ctx.nodeConfig = nodeConfig;
}

module.exports = {
  context,
  ctx
}