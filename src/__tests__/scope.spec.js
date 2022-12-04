const Scope = require("../Scope");

describe("Test Scope", () => {
  it("Simple Scope", () => {
    /**
     * const a=1;
     * function f(){
     *  const b=2;
     * }
     */
    const root = new Scope({});
    root.add("a");
    const child = new Scope({
      parent: root,
    });
    child.add("b");

    expect(child.contains("a")).toBe(true);
    expect(child.contains("b")).toBe(true);

    expect(child.findDefiningScope("a")).toBe(root);
    expect(child.findDefiningScope("b")).toBe(child);
  });
});
