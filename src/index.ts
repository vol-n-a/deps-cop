import { getDependencyMap } from "./utils/get-dependency-map";
import { getDependencyTree } from "./utils/get-dependency-tree";
import { getWhitelistConfig } from "./utils/get-whitelist-config";

const dependencyMap = getDependencyTree()
  .then(getDependencyMap)
  //   .then((dependencyMap) => {
  // for (const [dependency, versionMap] of dependencyMap.entries()) {
  //   if (Object.keys(versionMap).length > 1) {
  //     console.log(dependency);
  //   }
  // }
  //   })
  .then(getWhitelistConfig)
  .then(console.log);
