#!/usr/bin/env node

const rootPath = process.cwd(),
  args = process.argv,
  path = require("path"),
  fs = require("fs");

const nodemon = require("nodemon"),
  webpack = require("webpack");

const isDev = /dev/i.test(args[2]),
  targetApp = args[3] || (isDev ? undefined : args[2]),
  appPath = path.resolve(rootPath, targetApp),
  appServerPath = path.resolve(appPath, "server");

if (targetApp === undefined) {
  const targetErr = new Error();
  targetErr.name = "Undefined Target".toUpperCase();
  targetErr.message = "please provide <AppName> to start";
  throw targetErr;
} else if (/serve/i.test(args[2]))
  return nodemon({
    script: path.resolve(rootPath, "temp", targetApp + ".js"),
    cwd: appPath,
    ignore: ["node_modules/**", "config.js", "assets/**"],
  });

const config = {},
  modes = ["none", "development", "production"],
  targets = ["node", "web"];

config.target = targets[0];

const handlers = fs
  .readdirSync(appServerPath)
  .map((h) => path.resolve(appServerPath, h));

config.entry = handlers.concat(path.resolve(appPath, "config.js"));

console.log(config.entry);

return;

config.output = {
  chunkFormat: "commonjs",
};

config.resolve = {
  extensions: [".js", ".jsx"],
  alias: {},
};

config.externals = {
  __APP_DIR__: JSON.stringify(appPath),
  __ADDONS__: JSON.stringify(path.resolve(rootPath, "addons")),
  __HANDLERS__: JSON.stringify(handlers),
};

if (isDev) {
  config.mode = modes[1];
  config.output.path = path.resolve(rootPath, "temp");
  config.output.filename = path.basename(targetApp) + ".js";
  config.resolve.alias.xerex = path.resolve(__dirname, "scripts/dev.js");
} else {
  config.mode = modes[2];
  config.output.path = appPath;
  config.output.filename = "index.js";

  Object.assign(config.resolve.alias, {
    addons: path.resolve(rootPath, "addons"),
    server: path.resolve(rootPath, targetApp, "server"),
    xerex: path.resolve(__dirname, "scripts/prod.js"),
  });

  config.optimization = {
    moduleIds: "named",
  };
}

const compiler = webpack(config);

// // Specify the event hook to attach to
// compiler.hooks.emit.tap("_", (compilation) => {
//   console.log(compilation.addModule);

//   // Manipulate the build using the plugin API provided by webpack
//   const hooksPath = path.resolve(rootPath, targetApp, "server", "get");
//   // compilation.addModule(hooksPath);
// });

compiler.run((err, stats) => {
  if (err) console.log(err.name, "\n\n", err.message);
  compiler.close(() => {});
});
