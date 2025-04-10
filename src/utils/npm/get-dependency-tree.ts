import type { ExecException } from "node:child_process";
import { exec } from "node:child_process";

import type { Options } from "../../index.js";

export type Project = {
  version: string;
  name: string;
  dependencies: Record<string, Dependency>;
};

export type Dependency = {
  version: string;
  dependencies?: Record<string, Dependency>;
};

export type Node = Project | Dependency;

/**
 * Reads project's dependency tree and parses it to the js object
 *
 * To get the dependency tree, depscop executes the following npm cli command: `npm ls -a --json`
 *
 * @returns Project's dependency tree
 */
export const getDependencyTree = async (options: Options): Promise<Project> => {
  const lsOptions = ["-a", "--json"];

  if (options.prod) {
    lsOptions.push("--prod");
  }

  const dependencyTree = await new Promise<string>((resolve, reject) =>
    exec(
      `npm ls ${lsOptions.join(" ")}`,
      (error: ExecException | null, stdout: string) => {
        if (error && !error.stdout?.includes("ELSPROBLEMS")) {
          // reject(error);
        }

        resolve(stdout);
      }
    )
  );

  return JSON.parse(dependencyTree) as Project;
};
