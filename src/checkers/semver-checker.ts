import { satisfies } from "semver";

import { SemverRuleViolation, stats } from "../stats";
import type { DependencyMap } from "../utils/get-dependency-map";
import type { SemverRules } from "../utils/get-depscop-config";

const checkSemverRulesEntry = (
  dependencyMap: DependencyMap,
  [dependency, [version, reason]]: [string, [string, string]]
): void => {
  const dependencyValue = dependencyMap.get(dependency);

  // If the dependency from config is not installed, skip it
  if (!dependencyValue) {
    return;
  }

  // If the installed dependency satisfies the rule, skip
  if (
    dependencyValue.rootVersion &&
    satisfies(dependencyValue.rootVersion, version)
  ) {
    return;
  }

  // Report the error
  stats.addRuleViolation(
    new SemverRuleViolation(
      `${dependency}@${dependencyValue.rootVersion} does not satisfy ${dependency}@${version}`,
      { reason }
    )
  );
};

/**
 * Validates semver based depscop rules
 *
 * @param dependencyMap Dependency map
 * @param semverRules Depscop config
 */
export const semverChecker = (
  dependencyMap: DependencyMap,
  semverRules: SemverRules
): void => {
  Object.entries(semverRules).map((semverRulesEntry) =>
    checkSemverRulesEntry(dependencyMap, semverRulesEntry)
  );
};
