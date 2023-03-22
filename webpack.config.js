#!/usr/bin/env node

const path = require("path"),
  rootPath = process.cwd();
  
const nodemon = require("nodemon"),
  webpack = require("webpack");

const args = process.argv,
  isDev = args[2] === "serve",
  targetApp = args[3] || (isDev ? undefined : args[2]);

if (targetApp === undefined) {
  const targetErr = new Error();
  targetErr.name = "Undefined Target".toUpperCase();
  targetErr.message = "please specify an <AppName> to start";
  throw targetErr;
} else if (isDev) {
  return nodemon({
    cwd: path.resolve(rootPath, targetApp),
    ignore: ["node_modules/**"],
  });
}

const config = {},
  modes = ["none", "development", "production"],
  targets = ["node", "web"];

config.mode = modes[2];
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
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      module: {
        test: /[\\/]node_modules(?![\\/]envase)[\\/]/,
      },
    },
  },
};

try {
  const compiler = webpack(config);
  compiler.run();
  compiler.run();
} catch {
  console.log(config);
}
