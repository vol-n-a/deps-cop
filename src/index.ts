import { forbiddenChecker } from "./checkers/forbidden-checker";
import { recentChecker } from "./checkers/recent-checker";
import { semverChecker } from "./checkers/semver-checker";
import { getDependencyMap } from "./utils/get-dependency-map";
import { getDependencyTree } from "./utils/get-dependency-tree";
import { getDepscopConfig } from "./utils/get-depscop-config";

getDependencyTree()
  .then(getDependencyMap)
  //   .then((dependencyMap) => {
  // for (const [dependency, versionMap] of dependencyMap.entries()) {
  //   if (Object.keys(versionMap).length > 1) {
  //     console.log(dependency);
  //   }
  // }
  //   })
  // .then(getWhitelistConfig)
  .then(
    (res) =>
      new Map([...res.entries()].filter(([_dep, entry]) => entry.rootVersion))
  )
  .then((res) => Promise.all([res, getDepscopConfig()]))
  .then(([dependencyMap, { forbidden, recent, semver }]) => {
    forbiddenChecker(dependencyMap, forbidden);
    recentChecker(dependencyMap, recent);
    semverChecker(dependencyMap, semver);
  });
