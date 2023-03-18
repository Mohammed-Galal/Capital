function State() {}
module.exports = State;

const proto = State.prototype,
  err = new Error(),
  messages = {
    clueIsExsisted: "this clue is previously created".toUpperCase(),
    undefinedClue: "this clue is undefined".toUpperCase(),
  },
  setErrorData = function (CK, type) {
    err.name = CK;
    err.message = messages[type];
    return err;
  };

proto.create = function (CK) {
  if (this[CK] !== undefined) throw setErrorData(CK, "clueIsExsisted");
  this[CK] = null;
};

proto.set = function (key, val) {
  if (this[key] === undefined) throw setErrorData(CK, "undefinedClue");
  this[key] =
    (val !== undefined && val.constructor.name) === "Function"
      ? val(this[key])
      : val;
  return this[key];
};

proto.get = function (key) {
  if (this[key] === undefined) throw setErrorData(CK, "undefinedClue");
  return this[key];
};

proto.delete = function (key) {
  if (this[key] === undefined) throw setErrorData(CK, "undefinedClue");
  delete this[key];
};

proto.has = function (key) {
  return this[key] !== undefined;
};

proto.forEach = function (fn) {
  this.keys.forEach(fn, this);
};

proto.clear = function () {
  const that = this;
  this.forEach(function (prop) {
    delete that[prop];
  });
};

proto.json = function () {
  return JSON.stringify(this);
};

Object.defineProperties(proto, {
  keys: {
    enumerable: true,
    get() {
      return Object.keys(this);
    },
  },

  length: {
    enumerable: true,
    get() {
      return this.keys.length;
    },
  },
});
