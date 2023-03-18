const err = new Error("");

module.exports = function (paths, $handler) {
  const self = this,
    pathsType = paths.constructor.name;

  if (pathsType === "Function") return paths(self);
  else if (pathsType === "Object") {
    let isMatched = false;
    const routes = Object.keys(paths);
    routes.forEach(function (r) {
      if (isMatched === false) isMatched = self.route(r, paths[r]);
    });
    return isMatched;
  }

  const url = self.url,
    pathExp = url.test(paths);
  if (pathExp === false) return false;
  self.matchedRoutes.push(paths);
  url.openRoutes.push(pathExp);
  const handlerResult = $handler(self);
  url.openRoutes.pop();
  return handlerResult;
};
