import { mkdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { importJSModuleDefaultExport } from "../import-js-module-default-export.js";
import { mockConfigData } from "./mocks/index.js";

const tempDir = path.resolve(
  tmpdir(),
  `import-js-module-default-export-test-${Date.now()}`
);

describe("importJSModuleDefaultExport", () => {
  beforeAll(() => {
    mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true });
  });

  describe("existing file", () => {
    let tempFile: string;

    beforeEach(() => {
      tempFile = path.join(tempDir, `test-file-${Date.now()}.js`);
    });

    afterEach(() => {
      unlinkSync(tempFile);
    });

    it("reads a valid JavaScript file with default export object", async () => {
      const jsContent = `export default ${JSON.stringify(mockConfigData)};`;
      writeFileSync(tempFile, jsContent);

      const result = await importJSModuleDefaultExport(tempFile);

      expect(result).toEqual(mockConfigData);
    });

    it("throws an error when file contains invalid JavaScript syntax", async () => {
      const invalidJs =
        "export default { invalid: syntax, missing: quote and: comma }";
      writeFileSync(tempFile, invalidJs);

      await expect(importJSModuleDefaultExport(tempFile)).rejects.toThrow();
    });

    it("throws an error when file has no default export", async () => {
      const jsContent = `export const config = ${JSON.stringify(mockConfigData)};`;
      writeFileSync(tempFile, jsContent);

      await expect(importJSModuleDefaultExport(tempFile)).rejects.toThrow(
        `No default export found in JavaScript config file at ${tempFile}`
      );
    });
  });

  it("throws an error when file does not exist", async () => {
    const nonExistentFile = path.join(tempDir, "does-not-exist.js");

    await expect(
      importJSModuleDefaultExport(nonExistentFile)
    ).rejects.toThrow();
  });
});
