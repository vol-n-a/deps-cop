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
  vi,
} from "vitest";

import { importTSModuleDefaultExport } from "../import-ts-module-default-export.js";
import { mockConfigData } from "./mocks/index.js";

const tempDir = path.resolve(
  tmpdir(),
  `import-ts-module-default-export-test-${Date.now()}`
);

describe("importTSModuleDefaultExport", () => {
  beforeAll(() => {
    mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true });
  });

  describe("existing file", () => {
    let tempFile: string;

    beforeEach(() => {
      tempFile = path.join(tempDir, `test-file-${Date.now()}.ts`);
    });

    afterEach(() => {
      unlinkSync(tempFile);
    });

    it("reads a valid TypeScript file with default export object", async () => {
      const tsContent = `export default ${JSON.stringify(mockConfigData)} as const;`;
      writeFileSync(tempFile, tsContent);

      const result = await importTSModuleDefaultExport(tempFile);

      expect(result).toEqual(mockConfigData);
    });

    it("throws an error when file contains invalid TypeScript syntax", async () => {
      const invalidTs =
        "export default { invalid: syntax, missing: quote and: comma }";
      writeFileSync(tempFile, invalidTs);

      await expect(importTSModuleDefaultExport(tempFile)).rejects.toThrow();
    });

    it("throws an error when file has no default export", async () => {
      const tsContent = `export const config = ${JSON.stringify(mockConfigData)};`;
      writeFileSync(tempFile, tsContent);

      await expect(importTSModuleDefaultExport(tempFile)).rejects.toThrow(
        `No default export found in TypeScript config file at ${tempFile}`
      );
    });
  });

  it("throws an error when file does not exist", async () => {
    const nonExistentFile = path.join(tempDir, "does-not-exist.ts");

    await expect(
      importTSModuleDefaultExport(nonExistentFile)
    ).rejects.toThrow();
  });

  it("throws an error when TypeScript is not installed", async () => {
    vi.doMock("typescript", () => {
      throw new Error("Cannot find module 'typescript'");
    });

    await expect(
      importTSModuleDefaultExport(path.join(tempDir, "any-file.ts"))
    ).rejects.toThrow(
      "TypeScript is required to process .ts configuration files. Please install it as a dependency."
    );

    vi.unmock("typescript");
  });
});
