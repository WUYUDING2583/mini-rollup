const acorn = require("acorn");
const { default: MagicString } = require("magic-string");
const analyse = require("./analyse");

class Module {
  constructor({ code = "", path = "", bundle = null }) {
    this.code = new MagicString(code);
    this.ast = acorn.parse(code, {
      locations: true,
      ranges: true,
      sourceType: "module",
      ecmaVersion: 7,
    });
    this.imports = {};
    this.exports = {};
    this.definitions = {};
    this.analyse();
  }

  expandAllStatement() {
    const allStatements = [];
    this.ast.body.forEach((statement) => {
      if (
        statement.type === "ImportDeclaration" ||
        statement.type === "VariableDeclaration"
      )
        return;
      const statements = this.expandStatement(statement);
      allStatements.push(...statements);
    });
    return allStatements;
  }

  // return [declaration,call expression]
  expandStatement(statement) {
    console.log(this.code.snip(statement.start, statement.end).toString());
    const statements = [];
    if (statement.type === "ExpressionStatement") {
      Object.keys(statement._dependsOn).forEach((key) => {
        const definition = this.definitions[key];
        statements.push(definition);
      });
      statements.push(statement);
    }
    return statements;
  }

  analyse() {
    analyse(this.ast, this.code);
    this.ast.body.forEach((statement) => {
      if (statement.type === "ImportDeclaration") {
        statement.specifiers.forEach((s) => {
          this.imports[s.local.name] = {
            localName: s.local.name,
            name: s.imported ? s.imported.name : "",
            source: statement.source.value,
          };
        });
      }

      if (statement.type === "ExportNamedDeclaration") {
        if (statement.declaration) {
          statement.declaration.declarations.forEach((d) => {
            this.exports[d.id.name] = {
              localName: d.id.name,
              node: statement,
              expression: statement.declaration,
            };
          });
        }
      }

      Object.keys(statement._defines).forEach((key) => {
        this.definitions[key] = statement;
      });
    });
  }
}

module.exports = Module;
