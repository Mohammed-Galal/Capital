const http = require("http"),
  path = require("path"),
  { freezeObj, extentionExp, emptyStr, arrFrom } = require("../constants"),
  CONTAINER = require("../Container");

const ContainerProto = require("addons/container"),
  reqProto = require("addons/request"),
  resProto = require("addons/response");

const appDir = require("__APP_DIR__"),
  appName = require("__APP_NAME__"),
  serverHandlers = require("__HANDLERS__");

ContainerProto.appDir = appDir;
reqProto.appDir = appDir;
resProto.appDir = appDir;
Object.assign(CONTAINER.prototype, ContainerProto);
Object.assign(http.IncomingMessage.prototype, reqProto);
Object.assign(http.ServerResponse.prototype, resProto);

const httpMethods = new RegExp("(" + http.METHODS.join("|") + ")"),
  methodsInitialized = {},
  accessControlAllowMethods = [];

const handlersRegex = new RegExp(
  appName + "[\\/]server[\\/](" + serverHandlers.join("|") + ")"
);

const modules = __webpack_modules__;
Object.keys(modules).forEach(function (chunkName) {
  // get all methods initialized in the server folder and merge it with object above [methodsInitialized]
  const address = handlersRegex.exec(chunkName);
  if (address === null) return;
  const M = address[1].replace(extentionExp, emptyStr).toUpperCase();
  httpMethods.test(M) && accessControlAllowMethods.push(M);
  methodsInitialized[M] = modules[chunkName];
});

console.log(methodsInitialized, accessControlAllowMethods);

module.exports = APP;
const proto = APP.prototype;
function APP() {
  if (this.constructor !== APP) {
    const constructorError = new Error();
    constructorError.name = "Contructor Error".toUpperCase();
    constructorError.message = "App cannot get invoked without a new keyword";
    throw constructorError;
  }
}

proto.name = appName;

proto.listen = function () {
  const server = http.createServer(this.callback);
  return server.listen.apply(server, arrFrom(arguments));
};

proto.callback = function (req, res) {
  res.setHeader(
    "access-control-allow-methods",
    accessControlAllowMethods.toString()
  );

  const pre = methodsInitialized.INDEX.onStart,
    targetMethod = methodsInitialized[req.method],
    post = methodsInitialized.INDEX.onEnd;

  const CN = freezeObj(new CONTAINER(req, res));

  if ((pre === undefined ? true : pre(CN)) !== false) {
    targetMethod !== undefined && targetMethod(CN);
    post !== undefined && post(CN);
  }
};

Object.defineProperty(proto, "methods", {
  enumerable: true,
  get() {
    return arrFrom(accessControlAllowMethods);
  },
});
