const { parse } = require("acorn");
const { default: MagicString } = require("magic-string");
const analyse = require("./analyse");

const SYSTEM_VARS = ["console", "log"];

function has(obj, prop) {
  return Object.prototype.hasOwnProperty(obj, prop);
}

class Module {
  constructor({ code }) {
    this.code = new MagicString(code);
    this.ast = parse(code, {
      sourceType: "module",
      ecmaVersion: 7,
    });
    this.analyse();
  }

  analyse() {
    this.imports = {};
    this.exports = {};
    this.ast.body.forEach((node) => {
      if (node.type === "ImportDeclaration") {
        const source = node.source.value;
        const { specifiers } = node;
        specifiers.forEach((specifier) => {
          const localName = specifier.local ? specifier.local.name : "";
          const name = specifier.imported ? specifier.imported.name : "";
          this.imports[localName] = {
            localName,
            name,
            source,
          };
        });
      } else if (/^Export/.test(node.type)) {
        const { declaration } = node;
        if (declaration.type === "VariableDeclaration") {
          if (!declaration.declarations) return;
          const localName = declaration.declarations[0].id.name;
          this.exports[localName] = {
            node,
            localName,
            expression: declaration,
          };
        }
      }
    });

    analyse(this.ast, this.code, this);
    this.definitions = {};
    this.ast.body.forEach((statement) => {
      Object.keys(statement._defines).forEach((key) => {
        this.definitions[key] = statement;
      });
    });
  }

  expandAllStatement() {
    const allStatements = [];
    this.ast.body.forEach((statement) => {
      if (statement.type === "ImportDeclaration") return;
      if (statement.type === "VariableDeclaration") return;
      const statements = this.expandStatement(statement);
      allStatements.push(...statements);
    });
    return allStatements;
  }

  expandStatement(statement) {
    // this statement has been included
    statement._included = true;
    const result = [];
    Object.keys(statement._dependsOn).forEach((name) => {
      const definitions = this.define(name);
      result.push(...definitions);
    });
    result.push(statement);
    return result;
  }

  /**
   * search variable declaration
   * @param {string} name
   */
  define(name) {
    // import from outer module
    if (has(this.imports, name)) {
      // TODO load module
    } else {
      // current module
      const statement = this.definitions[name];
      if (statement) {
        if (statement._included) return [];
        // recursive
        // const b = a + 1 =>a = 2 + f => f = 1
        return this.expandStatement(statement);
      } else if (SYSTEM_VARS.includes(name)) {
        return [];
      } else {
        throw new Error(`Variable ${name} not found`);
      }
    }
  }
}

module.exports = Module;
