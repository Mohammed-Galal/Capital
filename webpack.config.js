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

config.target = targets[0];
config.entry = {
  index: path.resolve(rootPath, targetApp, "config.js"),
};

config.output = {
  chunkFormat: "commonjs",
};

config.resolve = {
  alias: {},
};

if (isDev) {
  config.mode = modes[1];
  config.output.path = path.resolve(rootPath, "temp");
  config.output.filename = path.basename(targetApp) + ".js";
  config.resolve.alias.xerex = path.resolve(__dirname, "scripts/dev.js");
  config.externals = {
    __APP_DIR__: JSON.stringify(path.resolve(rootPath, targetApp)),
    __ADDONS__: JSON.stringify(path.resolve(rootPath, "addons")),
  };
} else {
  // ======================
  // const methodsInitialized = {},
  //   accessControlAllowMethods = [];

  // fs.readdirSync(appDir + "/server").map(function (method) {
  //   // get all methods initialized in the server folder and merge it with object above [methodsInitialized]
  //   const M = method.toUpperCase().replace(extentionExp, emptyStr);
  //   httpMethods.test(M) && accessControlAllowMethods.push(M);
  //   methodsInitialized[M] = require("server/" + method);
  //   return M;
  // });

  // config.plugins = [
  //   new webpack.ProvidePlugin({
  //     test: path.resolve(rootPath, targetApp, "server/get"),
  //   }),
  // ];

  // console.log(config.plugins[0]);

  // ======================

  config.mode = modes[2];
  config.output.path = path.resolve(rootPath, targetApp);
  config.output.filename = ({ chunk }) =>
    (chunk.name === "index" ? "index" : "modules/[name]") + ".js";

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
}

try {
  const compiler = webpack(config);
  compiler.run();
} catch (e) {
  console.log(e.name, "\n\n", e.message);
}
