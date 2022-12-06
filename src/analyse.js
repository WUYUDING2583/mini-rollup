const Scope = require("./scope");
const walk = require("./walk");

/**
 * Analyse function
 * @param {*} ast
 * @param {MagicString} magicString
 * @param {*} module
 */
function analyse(ast, magicString, module) {
  // create global scope
  let scope = new Scope({});

  ast.body.forEach((statement) => {
    /**
     * Add variable to scope
     * @param {*} declaration declaration node
     */
    function addToScope(declaration) {
      const name = declaration.id.name;
      scope.add(name);
      if (!scope.parent) {
        statement._defines[name] = true;
      }
    }

    Object.defineProperties(statement, {
      _defines: { value: {} },
      _dependsOn: { value: {} },
    });
    walk(statement, {
      enter(node) {
        let newScope;
        switch (node.type) {
          case "FunctionDeclaration":
            // Add to scope
            addToScope(node);
            // Create new Scope
            const params = node.params.map((v) => v.name);
            newScope = new Scope({ parent: scope, params });
            break;
          case "VariableDeclaration":
            node.declarations.forEach(addToScope);
            break;
          default:
            break;
        }
        if (newScope) {
          Object.defineProperties(node, {
            _scope: { value: newScope },
          });
          scope = newScope;
        }
      },
      leave(node) {
        if (node._scope) {
          scope = scope.parent;
        }
      },
    });
  });

  ast._scope = scope;

  ast.body.forEach((statement) => {
    walk(statement, {
      enter(node) {
        if (node.type === "Identifier") {
          statement._dependsOn[node.name] = true;
        }
      },
    });
  });
}
module.exports = analyse;
