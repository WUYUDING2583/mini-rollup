const Bundle = require("../Bundle");
const fs = require("fs");

jest.mock("fs");
describe("Test Bundle", () => {
  it("Test fetchModule", () => {
    const bundle = new Bundle({ entry: "./a.js" });
    // when fs.readFileSync has been called, it will return 'const a = 1;'
    fs.readFileSync.mockReturnValueOnce("const a = 1;");
    // in a.js we use a variable/function of b.js
    const module = bundle.fetchModule("./b.js", "/c/a.js");
    const calls = fs.readFileSync.mock.calls;
    expect(calls[0][0]).toEqual("/c/b.js");
    // module.code is a MagicString instance
    expect(module.code.toString()).toEqual("const a = 1;");
  });

  describe("Test build", () => {
    it("Single statement", () => {
      const bundle = new Bundle({ entry: "./a.js" });
      fs.readFileSync.mockReturnValueOnce("console.log(1);");
      bundle.build("bundle.js");
      // fs.writeFileSync("bundle.js", "const a = 1;");
      const calls = fs.writeFileSync.mock.calls;
      expect(calls[0][0]).toEqual("bundle.js");
      expect(calls[0][1]).toEqual("console.log(1);");
    });

    it("Multi statements", () => {
      const bundle = new Bundle({ entry: "index.js" });
      fs.readFileSync.mockReturnValueOnce(
        `const a = () => 1;
      const b = () => 2;
      a()`
      );
      fs.writeFileSync.mock.calls = [];
      bundle.build("bundle.js");
      const { calls } = fs.writeFileSync.mock;
      expect(calls[0][0]).toBe("bundle.js");
      expect(calls[0][1]).toBe(
        `const a = () => 1;
a()`
      );
    });

    it("Multi modules", () => {
      const bundle = new Bundle({ entry: "index.js" });
      fs.readFileSync
        .mockReturnValueOnce(
          `import {a} from "./a.js";
a();`
        )
        .mockReturnValueOnce(`export const a = () => 1;`);
      fs.writeFileSync.mock.calls = [];
      bundle.build("bundle.js");
      const { calls } = fs.writeFileSync.mock;
      expect(calls[0][0]).toBe("bundle.js");
      expect(calls[0][1]).toBe(`const a = () => 1;
a();`);
    });
  });
});
