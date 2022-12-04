const analysis = require("../analysis");
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

describe("Test Analysis", () => {
  test("Basic Test", () => {
    const { ast, magicString } = getCode("const a=1;");
    analysis(ast, magicString);
    expect(ast._scope.contains("a")).toBe(true);
    expect(ast._scope.findDefiningScope("a")).toEqual(ast._scope);
  });
  test("Single line Test", () => {
    const { ast, magicString } = getCode("const a=1,b=2;");
    analysis(ast, magicString);
    expect(ast._scope.contains("a")).toBe(true);
    expect(ast._scope.findDefiningScope("b")).toEqual(ast._scope);
  });
  test("Multi Scope Test", () => {
    const { ast, magicString } = getCode(
      `   const a=1;
        function b(){
            const c=1;
        }
    `
    );
    analysis(ast, magicString);
    expect(ast._scope.contains("a")).toBe(true);
    expect(ast._scope.contains("c")).toBe(true);
    expect(ast._scope.findDefiningScope("a")).toEqual(ast._scope.parent);
    expect(ast._scope.findDefiningScope("c")).toEqual(ast._scope);
  });
});
