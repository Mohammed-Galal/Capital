#!/usr/bin/env node

const args = process.argv,
  targetApp = args[2];

if (targetApp === undefined) {
  const targetErr = new Error();
  targetErr.name = "Undefined Target".toUpperCase();
  targetErr.message = "please specify an <AppName> to start";
  throw targetErr;
}

const path = require("path"),
  rootPath = process.cwd(),
  webpack = require("webpack");

const config = {},
  modes = ["none", "development", "production"],
  targets = ["node", "web"];

config.mode = modes[2];
config.target = targets[0];
config.entry = {
  index: path.resolve(rootPath, targetApp, "config.js"),
};

config.output = {
  path: path.resolve(rootPath, targetApp),
  chunkFormat: "commonjs",
  filename: ({ chunk }) =>
    (chunk.name === "index" ? "index" : "modules/[name]") + ".js",
};

config.resolve = {
  alias: {
    addons: path.resolve(rootPath, "addons"),
  },
};

config.optimization = {
  chunkIds: "named",
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      module: {
        test: /[\\/]node_modules[\\/]/,
      },
    },
  },
};

try {
  const compiler = webpack(config);
  compiler.run();
} catch {
  console.log(config);
}
