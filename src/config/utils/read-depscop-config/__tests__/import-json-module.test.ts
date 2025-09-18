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

import { importJSONModule } from "../import-json-module.js";
import { mockConfigData } from "./mocks/index.js";

const tempDir = path.resolve(tmpdir(), `import-json-module-test-${Date.now()}`);

describe("importJSONModule", () => {
  beforeAll(() => {
    mkdirSync(tempDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true });
  });

  describe("existing file", () => {
    let tempFile: string;

    beforeEach(() => {
      tempFile = path.join(tempDir, `test-file-${Date.now()}.json`);
    });

    afterEach(() => {
      unlinkSync(tempFile);
    });

    it("reads a valid JSON file", async () => {
      const jsonContent = JSON.stringify(mockConfigData);
      writeFileSync(tempFile, jsonContent);

      const result = await importJSONModule(tempFile);

      expect(result).toEqual(mockConfigData);
    });

    it("throws an error when file contains invalid JSON", async () => {
      const invalidJson = '{ "invalid": json, "missing": quote }';
      writeFileSync(tempFile, invalidJson);

      await expect(importJSONModule(tempFile)).rejects.toThrow();
    });
  });

  it("throws an error when file does not exist", async () => {
    const nonExistentFile = path.join(tempDir, "does-not-exist.json");

    await expect(importJSONModule(nonExistentFile)).rejects.toThrow();
  });
});
