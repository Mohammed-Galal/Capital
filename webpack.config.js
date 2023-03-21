#!/usr/bin/env node

const args = process.argv,
  envMode = args[2] === "development" ? 1 : 2,
  isDev = envMode === 1,
  targetApp = args[3] || (!isDev ? envMode : undefined);

if (targetApp === undefined) {
  const targetErr = new Error();
  targetErr.name = "Undefined Target".toUpperCase();
  targetErr.message = "please specify an <AppName> to start";
  throw targetErr;
}

const nodemon = require("nodemon"),
  path = require("path"),
  rootPath = process.cwd(),
  webpack = require("webpack");

const config = {},
  modes = ["none", "development", "production"],
  targets = ["node", "web"];

config.mode = modes[envMode];
config.target = targets[0];
config.entry = {
  index: path.resolve(rootPath, targetApp, "config.js"),
};

config.output = {
  path: path.resolve(rootPath, targetApp),
  chunkFormat: "commonjs",
  filename: isDev
    ? "temp.js"
    : ({ chunk }) =>
        (chunk.name === "index" ? "index" : "modules/[name]") + ".js",
};

config.resolve = {
  alias: {
    addons: path.resolve(rootPath, "addons"),
  },
};

config.optimization = {
  chunkIds: "named",
  splitChunks: !isDev && {
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
  compiler.run(watchCallback);
} catch {
  console.log(config);
}

function watchCallback() {
  isDev &&
    nodemon(targetApp + "/temp.js", {
      ignore: ["node_modules/**", __dirname + __filename],
    });
}
