import { satisfies } from "semver";

import { ForbiddenRuleViolation, stats } from "../stats";
import type { DependencyMap } from "../utils/get-dependency-map";
import type { ForbiddenRules } from "../utils/get-depscop-config";

const checkForbiddenRulesEntry = (
  dependencyMap: DependencyMap,
  [dependency, [version, reason]]: [string, [string, string]]
): void => {
  const dependencyValue = dependencyMap.get(dependency);

  // If the dependency from config is not installed, skip it
  if (!dependencyValue) {
    return;
  }

  // If any version of the dependency from config is forbidded, report the error
  if (version === "any") {
    stats.addRuleViolation(
      new ForbiddenRuleViolation(`${dependency} is not allowed`, { reason })
    );

    return;
  }

  // If the dependency from config does not satisfy the rule, skip
  if (
    dependencyValue.rootVersion &&
    !satisfies(dependencyValue.rootVersion, version)
  ) {
    return;
  }

  // Report the error
  stats.addRuleViolation(
    new ForbiddenRuleViolation(
      `${dependency}@${dependencyValue.rootVersion} is not allowed`,
      { reason }
    )
  );
};

export const forbiddenChecker = (
  dependencyMap: DependencyMap,
  forbiddenRules: ForbiddenRules
): void => {
  Object.entries(forbiddenRules).map((forbiddenRulesEntry) =>
    checkForbiddenRulesEntry(dependencyMap, forbiddenRulesEntry)
  );
};
