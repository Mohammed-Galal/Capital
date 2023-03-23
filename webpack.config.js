#!/usr/bin/env node

const path = require("path"),
  rootPath = process.cwd();

const nodemon = require("nodemon"),
  webpack = require("webpack");

const args = process.argv,
  isDev = args[2] === "development",
  targetApp = args[3] || (isDev ? undefined : args[2]);

if (targetApp === undefined) {
  const targetErr = new Error();
  targetErr.name = "Undefined Target".toUpperCase();
  targetErr.message = "please provide <AppName> to start";
  throw targetErr;
} else if (args[2] === "serve")
  return nodemon({
    script: "temp.js",
    cwd: path.resolve(rootPath, targetApp),
    ignore: ["node_modules/**", "config.js", "assets/**"],
  });

const config = {},
  modes = ["none", "development", "production"],
  targets = ["node", "web"];

config.mode = modes[2];
config.target = targets[0];
config.entry = {
  index: path.resolve(rootPath, targetApp, "config.js"),
};

const filename = isDev ? "temp" : "index";
config.output = {
  path: path.resolve(rootPath, targetApp),
  chunkFormat: "commonjs",
  filename: ({ chunk }) =>
    (chunk.name === "index" ? filename : "modules/[name]") + ".js",
};

config.resolve = {
  alias: {
    envRequire: "./initMethodFuction/" + (isDev ? "dev" : "prod") + ".js",
    addons: path.resolve(rootPath, "addons"),
  },
};

config.optimization = {
  chunkIds: "named",
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      module: {
        test: /[\\/]node_modules(?![\\/]xerex)[\\/]/,
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
