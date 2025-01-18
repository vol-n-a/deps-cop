import { semverChecker } from "./checkers/semver-checker";
import { getDependencyMap } from "./utils/get-dependency-map";
import { getDependencyTree } from "./utils/get-dependency-tree";
import { getWhitelistConfig } from "./utils/get-whitelist-config";

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
  .then((res) => {
    console.log(res.get("react"));

    return new Map(res.entries().filter(([_dep, entry]) => entry.rootVersion));
  })
  .then((res) => Promise.all([res, getWhitelistConfig()]))
  .then((args) => semverChecker(...args));
