class Scope {
  constructor(options) {
    this.parent = options.parent;
    this.names = options.names;
  }

  /**
   *
   * @param {String} name variable name
   */
  add(name) {
    if (this.names) {
      this.names.push(name);
    } else {
      this.names = [name];
    }
  }

  /**
   * Check is variable declaraed
   * @param {*} name variable name
   * @return bool
   */
  contains(name) {
    return !!this.findDefiningScope(name);
  }

  /**
   * Return the scope where this variable is declaraed
   * @param {*} name variable name
   * @return Scope
   */
  findDefiningScope(name) {
    if (this.names && this.names.includes(name)) {
      return this;
    } else if (this.parent) {
      return this.parent.findDefiningScope(name);
    }
    return null;
  }
}

module.exports = Scope;
