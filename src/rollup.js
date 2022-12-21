const Bundle = require("./Bundle");

function rollup(entry, output) {
  const bunlde = new Bundle({ entry });
  bunlde.build(output);
}

module.exports = rollup;
