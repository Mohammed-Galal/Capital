const http = require("http"),
  fs = require("fs"),
  { freezeObj, extentionExp, emptyStr, arrFrom } = require("../constants"),
  CONTAINER = require("../Container");

const appDir = require("__APP_DIR__"),
  addonsDir = require("__ADDONS__");

const ContainerProto = __non_webpack_require__(addonsDir + "/container"),
  reqProto = __non_webpack_require__(addonsDir + "/request"),
  resProto = __non_webpack_require__(addonsDir + "/response");

const serverPath = appDir + "/server";
ContainerProto.appDir = appDir;
reqProto.appDir = appDir;
resProto.appDir = appDir;
Object.assign(CONTAINER.prototype, ContainerProto);
Object.assign(http.IncomingMessage.prototype, reqProto);
Object.assign(http.ServerResponse.prototype, resProto);

const httpMethods = new RegExp("(" + http.METHODS.join("|") + ")"),
  methodsInitialized = {},
  accessControlAllowMethods = [];

fs.readdirSync(serverPath).map(function (method) {
  // initMethods: get all methods initialized in the server folder and merge it with object above [methodsInitialized]
  const M = method.toUpperCase().replace(extentionExp, emptyStr);
  httpMethods.test(M) && accessControlAllowMethods.push(M);
  methodsInitialized[M] = __non_webpack_require__(serverPath + "/" + method);
  return M;
});

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
