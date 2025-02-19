import { forbiddenChecker } from "./checkers/forbidden-checker";
import { recentChecker } from "./checkers/recent-checker";
import { semverChecker } from "./checkers/semver-checker";
import { stats } from "./stats/stats";
import { getDependencyMap } from "./utils/get-dependency-map";
import { getDependencyTree } from "./utils/get-dependency-tree";
import { getDepscopConfig } from "./utils/get-depscop-config";

getDependencyTree()
  .then(getDependencyMap)
  .then(
    (res) =>
      new Map([...res.entries()].filter(([_dep, entry]) => entry.rootVersion))
  )
  .then((res) => Promise.all([res, getDepscopConfig()]))
  .then(([dependencyMap, { forbidden, recent, semver }]) =>
    Promise.all([
      forbiddenChecker(dependencyMap, forbidden),
      recentChecker(dependencyMap, recent),
      semverChecker(dependencyMap, semver),
    ])
  )
  .then(() => {
    console.log(stats.getInfo());
  });
