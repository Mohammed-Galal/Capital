const parseURL = require("url").parse,
  SP = URLSearchParams,
  {
    seperator,
    isArray,
    enumerable,
    extentionExp,
    objFromEntries,
    freezeObj,
  } = require("../constants"),
  firstExp = "^/?";

const trimEndExp = /\/?\$$/,
  trimVal = "/?$";

module.exports = UniformResourceLocator;

function UniformResourceLocator(url) {
  const urlObj = parseURL(url),
    pathName = formatPath(urlObj.pathname),
    openRoutes = (this.openRoutes = []);
  this.hash = urlObj.hash;
  this.path = {
    name: pathName,
    get params() {
      return new RegExp(firstExp + openRoutes.join(seperator)).exec(pathName)
        .groups;
    },
  };
  this.query = {
    raw: urlObj.query,
    params: objFromEntries(new SP(urlObj.query)),
  };
}

function formatPath(paths, handleExps) {
  if (isArray(paths)) return "(" + paths.map(formatPath).join("|") + ")";
  const path = paths.replace(trimEndExp, trimVal),
    pathNormailized = path.split(seperator);
  if (handleExps !== true) return pathNormailized.join(seperator);
  else return pathNormailized.map(paramHandler).join(seperator);
}

function paramHandler(str) {
  return str[0] === ":" ? "(?<" + str.slice(1) + ">[^/]+)" : str;
}

UniformResourceLocator.prototype.test = function ($path) {
  const openRoutes = this.openRoutes,
    path = this.path.name,
    pathExp = formatPath($path, true),
    regEx = new RegExp(firstExp + openRoutes.concat(pathExp).join(seperator));
  return regEx.test(path) && pathExp;
};

Object.defineProperty(UniformResourceLocator.prototype, "isFilePath", {
  enumerable,
  get() {
    return extentionExp.test(this.path.name);
  },
});
freezeObj(URL.prototype);
