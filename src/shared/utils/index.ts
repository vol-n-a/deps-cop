export {
  type DependenciesInstalled,
  getDependeniesInstalled,
} from "./get-dependencies-installed.js";
export { getRecentVersions } from "./get-recent-versions.js";
export { groupBy } from "./group-by.js";
export { getDependencyTree, getPackageVersions } from "./npm/index.js";
export { parseRecentVersions } from "./parse-recent-versions.js";
export {
  isArrayOfArrays,
  isModuleNotFoundError,
  isNonNullable,
  isPromiseLike,
  isRecord,
} from "./type-guards/index.js";
