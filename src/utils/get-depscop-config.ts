import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { getDepscopConfigPath } from "./get-depscop-config-path.js";
import { isPromiseLike } from "./type-guards/is-promise-like.js";
import { isRecord } from "./type-guards/is-record.js";

export type Version = string;
export type Reason = string;
export type DependencyName = string;

// TODO: Add rule level: 'warning' | 'error" (?)
// TODO: Add prerelease flag
export type Rule = [Version, Reason];
type Rules = Array<Rule>;
type RuleSet = Rule | Rules;

declare const __brand: unique symbol;
type RulesRecord<brand extends string> = Record<DependencyName, RuleSet> & {
  [__brand]?: brand;
};

export type ForbiddenRules = RulesRecord<"forbidden">;
export type RecentRules = RulesRecord<"recent">;
export type SemverRules = RulesRecord<"semver">;

export type DepscopConfig = {
  forbidden?: ForbiddenRules;
  recent?: RecentRules;
  semver?: SemverRules;
};

/**
 * Loads and returns the contents of the depscop configuration file
 *
 * @returns Depscop config
 */
export const getDepscopConfig = async (): Promise<DepscopConfig> => {
  const path = await getDepscopConfigPath();
  let defaultExport: unknown;

  if (path.endsWith(".json")) {
    // For JSON files, import them directly
    const url = pathToFileURL(path).href;
    defaultExport = (await import(url, { assert: { type: "json" } })).default;
  } else if (
    path.endsWith(".ts") ||
    path.endsWith(".mts") ||
    path.endsWith(".cts")
  ) {
    // For TypeScript files, transpile them to JavaScript and evaluate

    let typescript;
    try {
      typescript = await import("typescript");
    } catch {
      throw new Error(
        "TypeScript is required to process .ts configuration files. Please install it as a dependency."
      );
    }

    const { ModuleKind, ScriptTarget, transpileModule } = typescript;

    // Read the TypeScript file
    const tsContent = await readFile(path, "utf8");

    // Transpile to JavaScript
    const jsContent = transpileModule(tsContent, {
      compilerOptions: {
        module: ModuleKind.NodeNext,
        target: ScriptTarget.ES2015,
      },
    }).outputText;

    // Create a temporary module and evaluate it
    const tmpModule = new Function("exports", "require", jsContent);
    const exports: { default?: unknown } = {};
    const require = createRequire(import.meta.url);
    tmpModule(exports, require);

    defaultExport = exports.default;
  } else {
    // For other file types, import them directly
    const url = pathToFileURL(path).href;
    defaultExport = (await import(url)).default;
  }

  if (!defaultExport) {
    throw new Error("No default export found in the configuration file");
  }

  return (await resolveConfig(defaultExport)) as DepscopConfig;
};

const resolveConfig = async (defaultExport: unknown): Promise<unknown> => {
  let config: unknown;

  if (typeof defaultExport === "function") {
    const result = defaultExport();
    config = isPromiseLike(result) ? await result : result;
  } else {
    config = defaultExport;
  }

  if (!isRecord(config)) {
    throw new Error("Configuration must be a JavaScript object");
  }

  return config;
};
