const fs = require("fs");
const acorn = require("acorn");
const MagicString = require("magic-string");
const code = fs.readFileSync("./src/source.js", "utf-8").toString();
const walk = require("./src/walk");
const Scope = require("./src/scope");

const ast = acorn.parse(code, {
  locations: true,
  ranges: true,
  sourceType: "module",
  ecmaVersion: 7,
});

const m = new MagicString(code);

const declarations = {};
const statements = [];
// 将变量声明存储在map中
// ast.body.forEach((node) => {
//   const { type } = node;
//   if (type === "VariableDeclaration") {
//     declarations[node.declarations[0].id.name] = node;
//   }
// });
// // 遍历statement，记录被调用过的对象
// ast.body
//   .filter((node) => node.type !== "VariableDeclaration")
//   .forEach((node) => {
//     if (node.expression.callee.name) {
//       statements.push(declarations[node.expression.callee.name]);
//     } else {
//       statements.push(declarations[node.expression.arguments[0].callee.name]);
//     }
//     statements.push(node);
//   });

let str = "",
  intent = 0,
  count = 0;
let curScope = new Scope();
let nestedScope;

function entryFn(node, parent) {
  const { type, id } = node;
  if (type === "VariableDeclarator") {
    curScope.add(id.name);
    str += `${count} ${" ".repeat(intent)}variable: ${id.name}\n`;
    count++;
  } else if (type === "FunctionDeclaration") {
    curScope.add(id.name);
    str += `${count} ${" ".repeat(intent)}function: ${id.name}\n`;
    count++;
  } else if (type === "BlockStatement") {
    intent += 4;
    curScope = new Scope({ parent: curScope });
  }
}

function leaveFn(node, parent) {
  const { type, id } = node;
  if (type === "FunctionDeclaration") {
    intent = intent - 4;
    curScope = curScope.parent;
    nestedScope = curScope;
  }
}

walk(ast, { enter: entryFn, leave: leaveFn });
console.log(str);
console.log(nestedScope);

// console.log(ast);
// console.log(code);
// console.log(m.snip(0, 19).toString());
// console.log(declarations);
// statements.forEach((node) => {
//   const { start, end } = node;
//   console.log(m.snip(start, end).toString());
// });
