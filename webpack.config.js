#!/usr/bin/env node

const rootPath = process.cwd(),
  path = require("path"),
  fs = require("fs");
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
    script: path.resolve(rootPath, "temp", targetApp + ".js"),
    cwd: path.resolve(rootPath, targetApp),
    ignore: ["node_modules/**", "config.js", "assets/**"],
  });

const config = {},
  compiler = webpack(config);

const modes = ["none", "development", "production"],
  targets = ["node", "web"];

config.target = targets[0];

const entriesMap = {},
  entries = (config.entry = {
    index: path.resolve(rootPath, targetApp, "config.js"),
  });

config.output = {
  chunkFormat: "commonjs",
};

config.resolve = {
  extensions: [".js", ".jsx"],
  alias: {},
};

const externals = (config.externals = {
  __APP_DIR__: JSON.stringify(path.resolve(rootPath, targetApp)),
  __ADDONS__: JSON.stringify(path.resolve(rootPath, "addons")),
});

if (isDev) {
  config.mode = modes[1];
  config.output.path = path.resolve(rootPath, "temp");
  config.output.filename = path.basename(targetApp) + ".js";
  config.resolve.alias.xerex = path.resolve(__dirname, "scripts/dev.js");
} else {
  config.mode = modes[2];
  config.output.path = path.resolve(rootPath, targetApp);
  config.output.filename = (stats) => {
    const { chunk } = stats;
    if (entries[chunk.name]) entriesMap[chunk.name] = chunk.id;
    return (chunk.name === "index" ? "index" : "modules/[name]") + ".js";
  };

  Object.assign(config.resolve.alias, {
    addons: path.resolve(rootPath, "addons"),
    server: path.resolve(rootPath, targetApp, "server"),
    xerex: path.resolve(__dirname, "scripts/prod.js"),
  });

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

  // ============================================
  const handlers = fs.readdirSync(path.resolve(rootPath, targetApp, "server"));
  externals.handlers = JSON.stringify(handlers);
}

compiler.run(callback);
function callback(err, stats) {
  if (err) console.log(err.name, "\n\n", err.message);
  const mapPath = path.resolve(rootPath, targetApp, "serverMap.js");
  fs.writeFileSync(mapPath, "module.exports = " + JSON.stringify(entriesMap));
  // ==============
  compiler.close(() => {});
}
