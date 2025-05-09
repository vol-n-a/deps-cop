import type { ExecException } from "node:child_process";
import { exec } from "node:child_process";

import type { Options } from "../../command.js";

export type Project = {
  version: string;
  name: string;
  dependencies: Record<string, DependencyNode>;
};

export type DependencyNode = {
  version: string;
  dependencies?: Record<string, DependencyNode>;
};

export type Node = Project | DependencyNode;

/**
 * Reads project's dependency tree and parses it to the js object
 *
 * To get the dependency tree, depscop executes the following npm cli command: `npm ls -a --json`
 *
 * @returns Project's dependency tree
 */
export const getDependencyTree = async (options: Options): Promise<Project> => {
  const commandOptions = ["-a", "--json"];

  if (options.prod) {
    commandOptions.push("--prod");
  }

  const dependencyTree = await new Promise<string>((resolve, reject) =>
    exec(
      `npm ls ${commandOptions.join(" ")}`,
      (error: ExecException | null, stdout: string) => {
        if (error) {
          reject(error);
        }

        resolve(stdout);
      }
    )
  );

  return JSON.parse(dependencyTree) as Project;
};
