const nodemon = require("nodemon");

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

const { fork } = require("child_process"),
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
};

if (isDev) {
  config.output.filename = "temp.js";
} else {
  config.output.filename = (pathData) =>
    pathData.chunk.name === "index" ? "[name].js" : "modules/[name].js";
}

config.resolve = {
  alias: {
    ace: path.resolve(rootPath, "package/index.js"),
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

const pendingKillers = [];

try {
  const compiler = webpack(config),
    watchOptions = { ignored: /node_modules/ };

  compiler.run(watchCallback);
  // if (isDev) compiler.watch(watchOptions, watchCallback);
  // else compiler.run();
} catch {
  console.log(config);
}

function watchCallback() {
  isDev &&
    nodemon(targetApp + "/temp.js", {
      ignore: ["node_modules/**", __dirname + __filename],
    });

  // pendingKillers.forEach((fn) => fn());
  // pendingKillers.length = 0;
  // const modulePath = config.output.path + "\\" + targetApp + ".js",
  //   res = fork(modulePath, {
  //     killSignal: "SIGTERM",
  //   });
  // pendingKillers.push(() => res.kill("SIGTERM"));
}
