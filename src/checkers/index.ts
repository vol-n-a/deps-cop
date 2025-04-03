import { Listr } from "listr2";

import type { Options } from "../index.js";
import { stats } from "../stats/stats.js";
import { getDependencyMap } from "../utils/get-dependency-map.js";
import { getDepscopConfig } from "../utils/get-depscop-config.js";
import { getDependencyTree } from "../utils/npm/get-dependency-tree.js";
import { forbiddenChecker } from "./forbidden-checker.js";
import { recentChecker } from "./recent-checker.js";
import { semverChecker } from "./semver-checker.js";

export const runCheckers = async (options: Options): Promise<void> => {
  const { forbidden, recent, semver } = await getDepscopConfig();

  const dependencyTree = await getDependencyTree();
  const dependencyMap = getDependencyMap(dependencyTree);

  const rootDependenciesMap = new Map(
    Array.from(dependencyMap.entries()).filter(([, entry]) => entry.rootVersion)
  );

  const listr = new Listr(
    [
      {
        title: "Forbidden rules check",
        task: () => forbiddenChecker(rootDependenciesMap, forbidden),
      },
      {
        title: "Recent rules check",
        task: async () => recentChecker(rootDependenciesMap, recent, options),
      },
      {
        title: "Semver rules check",
        task: () => semverChecker(rootDependenciesMap, semver),
      },
    ],
    {
      concurrent: true,
    }
  );

  try {
    await listr.run();
  } catch (error) {
    console.log(error);
  }

  const hasProblems = stats.printProblems();

  if (!hasProblems) {
    process.exit(1);
  }
};
