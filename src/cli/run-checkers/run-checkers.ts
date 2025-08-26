import { Listr } from "listr2";

import { readDepscopConfig } from "../../config/index.js";
import type { CliOptions } from "../model/types.js";
import { stats } from "../stats/stats.js";
import {
  forbiddenChecker,
  recentChecker,
  semverChecker,
} from "./checkers/index.js";
import { getDependenciesInstalled } from "./utils/get-dependencies-installed.js";
import { getDependencyTree } from "./utils/get-dependency-tree.js";
import { isNonNullable } from "./utils/index.js";

export const runCheckers = async (cliOptions: CliOptions): Promise<void> => {
  const { forbidden, recent, semver } = await readDepscopConfig();

  const dependencyTree = await getDependencyTree(cliOptions);
  const dependenciesInstalled = getDependenciesInstalled(dependencyTree);

  const rootDependenciesInstalled = new Map(
    Array.from(dependenciesInstalled.entries()).filter(
      ([, entry]) => entry.rootVersion
    )
  );

  // TODO: Remove this once depscop config resolver is implemented
  if (!forbidden && !recent && !semver) {
    throw new Error("No rulesets found in DepsCop configuration");
  }

  const listr = new Listr(
    // TODO: Make checkers pluggable
    [
      forbidden && {
        title: "Forbidden rules check",
        task: () =>
          forbiddenChecker(rootDependenciesInstalled, forbidden, cliOptions),
      },
      recent && {
        title: "Recent rules check",
        task: async () =>
          recentChecker(rootDependenciesInstalled, recent, cliOptions),
      },
      semver && {
        title: "Semver rules check",
        task: () =>
          semverChecker(rootDependenciesInstalled, semver, cliOptions),
      },
    ].filter(isNonNullable),
    {
      concurrent: true,
    }
  );
  await listr.run();

  const { hasProblems } = stats.printProblems();

  if (hasProblems) {
    process.exit(1);
  }
};
