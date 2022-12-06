const analyse = require("../analyse");
const acorn = require("acorn");
const MagicString = require("magic-string");

function getCode(code) {
  const ast = acorn.parse(code, {
    locations: true,
    ranges: true,
    sourceType: "module",
    ecmaVersion: 7,
  });
  const magicString = new MagicString(code);
  return {
    ast,
    magicString,
  };
}

describe("Test Analyse", () => {
  it("Test _scope _defines", () => {
    const { ast, magicString } = getCode("const a=1;");
    analyse(ast, magicString);
    // ast._scope global scope
    expect(ast._scope.contains("a")).toBe(true);
    expect(ast._scope.findDefiningScope("a")).toEqual(ast._scope);
    expect(ast.body[0]._defines).toEqual({ a: true });
  });

  describe("Test _dependsOn", () => {
    it("Test Single Statement", () => {
      const { ast, magicString } = getCode("const a=1;");
      analyse(ast, magicString);
      // ast._scope global scope
      expect(ast.body[0]._dependsOn).toEqual({ a: true });
    });

    it("Test Single Statement", () => {
      const { ast, magicString } = getCode(
        `const a=1;
            function f(){
                const b=2;
            }
        `
      );
      analyse(ast, magicString);
      // ast._scope global scope
      expect(ast.body[0]._dependsOn).toEqual({ a: true });
      expect(ast.body[1]._dependsOn).toEqual({ f: true, b: true });
    });
  });
});
