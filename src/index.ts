import { Listr } from "listr2";

import { forbiddenChecker } from "./checkers/forbidden-checker";
import { recentChecker } from "./checkers/recent-checker";
import { semverChecker } from "./checkers/semver-checker";
import { stats } from "./stats/stats";
import { getDependencyMap } from "./utils/get-dependency-map";
import { getDepscopConfig } from "./utils/get-depscop-config";
import { getDependencyTree } from "./utils/npm/get-dependency-tree";

getDependencyTree()
  .then(getDependencyMap)
  .then(
    (res) =>
      new Map([...res.entries()].filter(([_dep, entry]) => entry.rootVersion))
  )
  .then((res) => Promise.all([res, getDepscopConfig()]))
  .then(([dependencyMap, { forbidden, recent, semver }]) => {
    const listr = new Listr(
      [
        {
          title: "Forbidden rules check",
          task: () => forbiddenChecker(dependencyMap, forbidden),
        },
        {
          title: "Recent rules check",
          task: async () => recentChecker(dependencyMap, recent),
        },
        {
          title: "Semver rules check",
          task: () => semverChecker(dependencyMap, semver),
        },
      ],
      {
        concurrent: true,
      }
    );

    return listr.run().catch(console.error);
  })
  .then(() => {
    console.log(stats.getInfo());
  });
