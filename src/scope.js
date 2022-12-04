class Scope {
  constructor({ parent } = {}) {
    this.parent = parent;
    this.names = [];
  }

  add(name) {
    this.names.push(name);
  }

  contains(name) {
    return !!this.findDefiningScope(name);
  }

  findDefiningScope(name) {
    if (this.names.includes(name)) return this;
    if (this.parent) {
      return this.parent.findDefiningScope(name);
    }
    return null;
  }
}

module.exports = Scope;
