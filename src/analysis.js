const Scope = require("./scope");
const walk = require("./walk");
/**
 * 分析函数
 * @param {*} ast
 * @param {*} magicString
 */
function analysis(ast, magicString) {
  let curScope = new Scope();
  let nestedScope = curScope;
  // 引入多个变量有问题
  function entryFn(node, parent) {
    const { type, id } = node;
    switch (type) {
      case "VariableDeclarator":
        curScope.add(id.name);
        break;
      case "FunctionDeclaration":
        curScope.add(id.name);
        curScope = new Scope({ parent: curScope });
        nestedScope = curScope;
        break;
    }
  }

  function leaveFn(node, parent) {
    const { type, id } = node;
    if (type === "FunctionDeclaration") {
      curScope = curScope.parent;
    }
  }

  ast.body.forEach((statement) =>
    walk(statement, { enter: entryFn, leave: leaveFn })
  );
  ast._scope = nestedScope;
  console.log(nestedScope);
}
module.exports = analysis;
