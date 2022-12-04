const fs = require("fs");
const acorn = require("acorn");
const MagicString = require("magic-string");
const walk = require("./src/walk");

const code = fs.readFileSync("./src/source.js", "utf-8").toString();

const ast = acorn.parse(code, {
  locations: true,
  ranges: true,
  sourceType: "module",
  ecmaVersion: 7,
});

let indent = 0;
walk(ast, {
  enter(node) {
    if (node.type === "VariableDeclarator") {
      console.log(`${" ".repeat(indent * 4)}var:`, node.id.name);
    }
    if (node.type === "FunctionDeclaration") {
      console.log(`${" ".repeat(indent * 4)}fun:`, node.id.name);
      indent++;
    }
  },
  leave(node) {
    if (node.type === "FunctionDeclaration") {
      indent--;
    }
  },
});

// console.log(ast);

// // loop => search variable declaration
// const declarations = {};
// ast.body
//   .filter((v) => v.type === "VariableDeclaration")
//   .forEach((v) => {
//     // console.log(v.declarations[0].id.name);
//     declarations[v.declarations[0].id.name] = v;
//   });
// // loop => pub declaration before statement
// // a() => const a=()=>1;a();
// const statements = [];
// ast.body
//   .filter((v) => v.type !== "VariableDeclaration")
//   .forEach((node) => {
//     statements.push(declarations[node.expression.callee.name]);
//     statements.push(node);
//   });
// // export
// const m = new MagicString(code);
// statements.forEach((node) => {
//   console.log(m.snip(node.start, node.end).toString());
// });
