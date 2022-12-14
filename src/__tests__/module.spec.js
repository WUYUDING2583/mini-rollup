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

  describe("ExpandAllStatement", () => {
    it("Basic", () => {
      const code = `const a = ()=>1;
                    const b=()=>2;
                    a();
                    a();
                    console.log(1);
        `;
      const module = new Module({ code });
      const statements = module.expandAllStatement();
      expect(statements.length).toBe(4);
      expect(
        module.code.snip(statements[0].start, statements[0].end).toString()
      ).toEqual("const a = ()=>1;");
      expect(
        module.code.snip(statements[1].start, statements[1].end).toString()
      ).toEqual("a();");
      expect(
        module.code.snip(statements[2].start, statements[2].end).toString()
      ).toEqual("a();");
      expect(
        module.code.snip(statements[3].start, statements[3].end).toString()
      ).toEqual("console.log(1);");
    });
  });
});
