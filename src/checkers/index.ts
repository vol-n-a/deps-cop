import { Listr } from "listr2";

import type { Options } from "../command.js";
import { stats } from "../stats/stats.js";
import { readDepscopConfig } from "../utils/config/read-depscop-config.js";
import { getDependeniesInstalled } from "../utils/get-dependencies-installed.js";
import { getDependencyTree } from "../utils/npm/get-dependency-tree.js";
import { isNonNullable } from "../utils/type-guards/is-non-nullable.js";
import { forbiddenChecker } from "./forbidden-checker.js";
import { recentChecker } from "./recent-checker.js";
import { semverChecker } from "./semver-checker.js";

export const runCheckers = async (options: Options): Promise<void> => {
  const { forbidden, recent, semver } = await readDepscopConfig();

  const dependencyTree = await getDependencyTree(options);
  const dependenciesInstalled = getDependeniesInstalled(dependencyTree);

  const rootDependenciesInstalled = new Map(
    Array.from(dependenciesInstalled.entries()).filter(
      ([, entry]) => entry.rootVersion
    )
  );

  if (!forbidden && !recent && !semver) {
    throw new Error("No rulesets found in DepsCop configuration");
  }

  const listr = new Listr(
    // TODO: Make checkers pluggable
    [
      forbidden && {
        title: "Forbidden rules check",
        task: () => forbiddenChecker(rootDependenciesInstalled, forbidden),
      },
      recent && {
        title: "Recent rules check",
        task: async () =>
          recentChecker(rootDependenciesInstalled, recent, options),
      },
      semver && {
        title: "Semver rules check",
        task: () => semverChecker(rootDependenciesInstalled, semver),
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
