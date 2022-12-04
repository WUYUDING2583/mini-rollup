/**
 * Loop AST
 */
function walk(ast, { enter, leave }) {
  visit(ast, null, enter, leave);
}

function visit(node, parent, enter, leave) {
  if (!node) return;
  if (enter) enter.call(null, node, parent);
  const children = Object.keys(node).filter(
    (key) => typeof node[key] === "object"
  );
  children.forEach((childKey) => {
    const value = node[childKey];
    visit(value, node, enter, leave);
  });
  if (leave) leave.call(null, node, parent);
}
module.exports = walk;
