import { satisfies } from "semver";

import { SemverRuleViolation, stats } from "../stats/index.js";
import type { DependenciesInstalled } from "../utils/get-dependencies-installed.js";
import type {
  DependencyName,
  Rule,
  SemverRules,
} from "../utils/get-depscop-config.js";
import { isArrayOfArrays } from "../utils/type-guards/is-array-of-arrays.js";

const checkSemverRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependency: DependencyName,
  [version, reason]: Rule
): void => {
  const dependencyValue = dependenciesInstalled.get(dependency);

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
 * @param dependenciesInstalled Dependency map
 * @param semverRules Depscop config
 */
export const semverChecker = (
  dependenciesInstalled: DependenciesInstalled,
  semverRules: SemverRules
): void => {
  Object.entries(semverRules).forEach(([dependency, ruleSet]) => {
    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkSemverRule(dependenciesInstalled, dependency, rule);
      });

      return;
    }

    checkSemverRule(dependenciesInstalled, dependency, ruleSet);
  });
};
