const Scope = require("../scope");

describe("Test Scope", () => {
  test("Basic Test", () => {
    // const a=1;
    // function f(){
    //     const b=2;
    // }
    const root = new Scope();
    root.add("a");
    const child = new Scope({ parent: root });
    child.add("b");
    expect(child.contains("a")).toBe(true);
    expect(child.contains("b")).toBe(true);
    expect(child.findDefiningScope("a")).toEqual(root);
    expect(child.findDefiningScope("b")).toEqual(child);
  });
});
