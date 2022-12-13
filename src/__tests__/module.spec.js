const Module = require("../Module");
const acorn = require("acorn");

describe("Test Module", () => {
  describe("Constructor", () => {
    describe("import", () => {
      it("Single Import", () => {
        const code = "import {a as aa} from '../module';";
        const module = new Module({ code });
        expect(module.imports).toEqual({
          aa: {
            localName: "aa",
            name: "a",
            source: "../module",
          },
        });
      });

      it("Multi Import", () => {
        const code = "import {a as aa,b} from '../module';";
        const module = new Module({ code });
        expect(module.imports).toEqual({
          aa: {
            localName: "aa",
            name: "a",
            source: "../module",
          },
          b: {
            localName: "b",
            name: "b",
            source: "../module",
          },
        });
      });
    });

    describe("export", () => {
      it("Single Export", () => {
        const code = "export var a = 1;";
        const module = new Module({ code });
        expect(module.exports["a"].localName).toBe("a");
        expect(module.exports["a"].node).toBe(module.ast.body[0]);
        expect(module.exports["a"].expression).toBe(
          module.ast.body[0].declaration
        );
      });
    });

    describe("definitions", () => {
      it("Single Variable", () => {
        const code = "const a = 1;";
        const module = new Module({ code });
        expect(module.definitions).toEqual({ a: module.ast.body[0] });
      });
    });
  });
});
