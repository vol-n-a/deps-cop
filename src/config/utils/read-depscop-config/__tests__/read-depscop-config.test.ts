import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readDepscopConfig } from "../read-depscop-config.js";
import { mockConfigData } from "./mocks/index.js";

const jsonMockConfig = { ...mockConfigData, sourse: "json" };
const tsMockConfig = { ...mockConfigData, sourse: "ts" };
const mtsMockConfig = { ...mockConfigData, sourse: "mts" };
const jsMockConfig = { ...mockConfigData, sourse: "js" };
const mjsMockConfig = { ...mockConfigData, sourse: "mjs" };

describe("readDepscopConfig", () => {
  let tempDir: string;
  let configPaths: {
    json: string;
    ts: string;
    mts: string;
    js: string;
    mjs: string;
  };

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `read-depscop-config-test-${Date.now()}`);

    mkdirSync(tempDir, { recursive: true });
    process.chdir(tempDir);

    configPaths = {
      json: path.join(tempDir, "depscop.config.json"),
      ts: path.join(tempDir, "depscop.config.ts"),
      mts: path.join(tempDir, "depscop.config.mts"),
      js: path.join(tempDir, "depscop.config.js"),
      mjs: path.join(tempDir, "depscop.config.mjs"),
    };
  });

  afterEach(() => {
    for (const configPath of Object.values(configPaths)) {
      if (existsSync(configPath)) {
        unlinkSync(configPath);
      }
    }
  });

  describe("file priority order", () => {
    it("prioritizes .json over other extensions", async () => {
      writeFileSync(configPaths.json, JSON.stringify(jsonMockConfig));
      writeFileSync(
        configPaths.ts,
        `export default ${JSON.stringify(tsMockConfig)} as const;`
      );
      writeFileSync(
        configPaths.mts,
        `export default ${JSON.stringify(mtsMockConfig)} as const;`
      );
      writeFileSync(
        configPaths.js,
        `export default ${JSON.stringify(jsMockConfig)};`
      );
      writeFileSync(
        configPaths.mjs,
        `export default ${JSON.stringify(mjsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(jsonMockConfig);
    });

    it("prioritizes .ts over .mts, .js and .mjs", async () => {
      writeFileSync(
        configPaths.ts,
        `export default ${JSON.stringify(tsMockConfig)} as const;`
      );
      writeFileSync(
        configPaths.mts,
        `export default ${JSON.stringify(mtsMockConfig)} as const;`
      );
      writeFileSync(
        configPaths.js,
        `export default ${JSON.stringify(jsMockConfig)};`
      );
      writeFileSync(
        configPaths.mjs,
        `export default ${JSON.stringify(mjsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(tsMockConfig);
    });

    it("prioritizes .mts over .js and .mjs", async () => {
      writeFileSync(
        configPaths.mts,
        `export default ${JSON.stringify(mtsMockConfig)} as const;`
      );
      writeFileSync(
        configPaths.js,
        `export default ${JSON.stringify(jsMockConfig)};`
      );
      writeFileSync(
        configPaths.mjs,
        `export default ${JSON.stringify(mjsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(mtsMockConfig);
    });

    it("prioritizes .js over .mjs", async () => {
      writeFileSync(
        configPaths.js,
        `export default ${JSON.stringify(jsMockConfig)};`
      );
      writeFileSync(
        configPaths.mjs,
        `export default ${JSON.stringify(mjsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(jsMockConfig);
    });

    it("reads a valid .mjs config file when only .mjs exists", async () => {
      writeFileSync(
        configPaths.mjs,
        `export default ${JSON.stringify(mjsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(mjsMockConfig);
    });
  });

  describe("JSON configs", () => {
    it("reads a valid .json config file", async () => {
      writeFileSync(configPaths.json, JSON.stringify(jsonMockConfig));

      const result = await readDepscopConfig();

      expect(result).toEqual(jsonMockConfig);
    });

    it("throws an error for invalid JSON syntax", async () => {
      writeFileSync(configPaths.json, '{ "invalid": json, "missing": quote }');

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.json}: Failed to parse JSON file, invalid JSON syntax found at position 12`
      );
    });
  });

  describe("TypeScript object-based configs", () => {
    it("reads a valid .ts config file", async () => {
      writeFileSync(
        configPaths.ts,
        `export default ${JSON.stringify(tsMockConfig)} as const;`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(tsMockConfig);
    });

    it("reads a valid .mts config file", async () => {
      writeFileSync(
        configPaths.mts,
        `export default ${JSON.stringify(mtsMockConfig)} as const;`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(mtsMockConfig);
    });

    it("throws an error for invalid TypeScript syntax", async () => {
      writeFileSync(
        configPaths.ts,
        "export default { invalid: syntax, missing: comma }"
      );

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.ts}: syntax is not defined`
      );
    });

    it("throws an error when .ts file exports a non-object value", async () => {
      writeFileSync(configPaths.ts, 'export default "not a config object";');

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.ts}: DepsCop configuration must be a JavaScript object`
      );
    });

    it("throws an error when .ts file has no default export", async () => {
      writeFileSync(
        configPaths.ts,
        `export const config = ${JSON.stringify(tsMockConfig)};`
      );

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.ts}: No default export found in TypeScript config file at ${configPaths.ts}`
      );
    });

    it("throws an error when TypeScript is not installed", async () => {
      vi.doMock("typescript", () => {
        throw new Error("Cannot find module 'typescript'");
      });

      writeFileSync(
        configPaths.ts,
        `export default ${JSON.stringify(tsMockConfig)} as const;`
      );

      await expect(readDepscopConfig()).rejects.toThrow(
        "TypeScript is required to process .ts configuration files. Please install it as a dependency."
      );

      vi.doUnmock("typescript");
    });
  });

  describe("JavaScript object-based configs", () => {
    it("reads a valid .js config file", async () => {
      writeFileSync(
        configPaths.js,
        `export default ${JSON.stringify(jsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(jsMockConfig);
    });

    it("reads a valid .mjs config file", async () => {
      writeFileSync(
        configPaths.mjs,
        `export default ${JSON.stringify(mjsMockConfig)};`
      );

      const result = await readDepscopConfig();

      expect(result).toEqual(mjsMockConfig);
    });

    it("throws an error for invalid JavaScript syntax", async () => {
      writeFileSync(
        configPaths.js,
        "export default { invalid: syntax, missing: comma }"
      );

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.js}: syntax is not defined`
      );
    });

    it("throws an error when .js file exports a non-object value", async () => {
      writeFileSync(configPaths.js, 'export default "not a config object";');

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.js}: DepsCop configuration must be a JavaScript object`
      );
    });

    it("throws an error when .js file has no default export", async () => {
      writeFileSync(
        configPaths.js,
        `export const config = ${JSON.stringify(jsMockConfig)};`
      );

      await expect(readDepscopConfig()).rejects.toThrow(
        `Error processing ${configPaths.js}: No default export found in JavaScript config file at ${configPaths.js}`
      );
    });
  });

  describe("TypeScript function-based configs", () => {
    it("handles .ts config functions that return objects", async () => {
      const configFunction = `export default () => (${JSON.stringify(tsMockConfig)});`;
      writeFileSync(configPaths.ts, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(tsMockConfig);
    });

    it("handles .mts config functions that return objects", async () => {
      const configFunction = `export default () => (${JSON.stringify(mtsMockConfig)});`;
      writeFileSync(configPaths.mts, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(mtsMockConfig);
    });
  });

  describe("JavaScript function-based configs", () => {
    it("handles .js config functions that return objects", async () => {
      const configFunction = `export default () => (${JSON.stringify(jsMockConfig)});`;
      writeFileSync(configPaths.js, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(jsMockConfig);
    });

    it("handles .mjs config functions that return objects", async () => {
      const configFunction = `export default () => (${JSON.stringify(mjsMockConfig)});`;
      writeFileSync(configPaths.mjs, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(mjsMockConfig);
    });
  });

  describe("TypeScript promise returning function-based configs", () => {
    it("handles .ts config functions that return promises", async () => {
      const configFunction = `export default () => Promise.resolve(${JSON.stringify(tsMockConfig)});`;
      writeFileSync(configPaths.ts, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(tsMockConfig);
    });

    it("handles .mts config functions that return promises", async () => {
      const configFunction = `export default () => Promise.resolve(${JSON.stringify(mtsMockConfig)});`;
      writeFileSync(configPaths.mts, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(mtsMockConfig);
    });
  });

  describe("JavaScript promise returning function-based configs", () => {
    it("handles .js config functions that return promises", async () => {
      const configFunction = `export default () => Promise.resolve(${JSON.stringify(jsMockConfig)});`;
      writeFileSync(configPaths.js, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(jsMockConfig);
    });

    it("handles .mjs config functions that return promises", async () => {
      const configFunction = `export default () => Promise.resolve(${JSON.stringify(mjsMockConfig)});`;
      writeFileSync(configPaths.mjs, configFunction);

      const result = await readDepscopConfig();

      expect(result).toEqual(mjsMockConfig);
    });
  });

  it("throws an error when there are no config files", async () => {
    await expect(readDepscopConfig()).rejects.toThrow(
      "No configuration file found. Please create one of the following files in your project root: depscop.config.json, depscop.config.ts, depscop.config.mts, depscop.config.js, depscop.config.mjs."
    );
  });
});
