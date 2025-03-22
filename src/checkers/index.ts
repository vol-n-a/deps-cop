import { Listr } from "listr2";

import { stats } from "../stats/stats";
import { getDependencyMap } from "../utils/get-dependency-map";
import { getDepscopConfig } from "../utils/get-depscop-config";
import { getDependencyTree } from "../utils/npm/get-dependency-tree";
import { forbiddenChecker } from "./forbidden-checker";
import { recentChecker } from "./recent-checker";
import { semverChecker } from "./semver-checker";

export const runCheckers = async (): Promise<void> => {
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
        task: async () => recentChecker(rootDependenciesMap, recent),
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

  stats.print();
};
