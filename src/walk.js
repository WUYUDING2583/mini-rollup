/**
 * AST语法树遍历
 */
function walk(ast, { enter, leave }) {
  visit(ast, null, enter, leave);
}

/**
 * 访问者
 * @param {*} node
 * @param {*} parent
 * @param {*} enter
 * @param {*} leave
 * @returns
 */
function visit(node, parent, enter, leave) {
  // 实现部分
  if (typeof node !== "object" || !node) return;
  enter(node);
  if (Array.isArray(node)) {
    for (let obj of node) {
      visit(obj, node, enter, leave);
    }
  } else {
    for (let key in node) {
      visit(node[key], node, enter, leave);
    }
  }
  leave(node);
}

module.exports = walk;
