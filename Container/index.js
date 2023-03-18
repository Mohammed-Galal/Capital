const URL = require("./UniformResourceLocator"),
  { enumerable, freezeObj } = require("../constants"),
  MapPolyfill = require("./mapPolyfill"),
  router = require("./router");

module.exports = CONTAINER;

function CONTAINER(req, res) {
  this.__proto__.req = req;
  this.__proto__.res = res;
  this.state = new MapPolyfill();
  this.matchedRoutes = [];
  this.url = new URL(req.url);
  this.host = req.headers.host;
  this.route = router.bind(this);
  freezeObj(this.url);
}

Object.defineProperties(CONTAINER.prototype, {
  port: {
    enumerable,
    get() {
      return this.host.match(/(?<=\:)\d+$/)[0];
    },
  },
  ip: {
    enumerable,
    get() {
      return this.req.headers["x-forwarded-for"];
    },
  },
  subdomains: {
    enumerable,
    get() {
      return this.host.split(".").slice(0, -1);
    },
  },
});
