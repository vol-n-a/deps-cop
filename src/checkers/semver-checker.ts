import { satisfies } from "semver";

import type { Options } from "../command.js";
import { SemverRuleViolation, stats } from "../stats/index.js";
import {
  type DependencyName,
  type Rule,
  type SemverRules,
  Severity,
} from "../utils/config/types.js";
import type { DependenciesInstalled } from "../utils/get-dependencies-installed.js";
import { isArrayOfArrays } from "../utils/type-guards/is-array-of-arrays.js";

const checkSemverRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependency: DependencyName,
  [version, reason, ruleOptions]: Rule,
  cliOptions: Options
): void => {
  const severity = ruleOptions?.severity ?? Severity.ERROR;
  const dependencyValue = dependenciesInstalled.get(dependency);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (severity === Severity.WARNING && cliOptions.quiet) {
    return;
  }

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
      {
        reason,
        severity,
      }
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
  semverRules: SemverRules,
  cliOptions: Options
): void => {
  Object.entries(semverRules).forEach(([dependency, ruleSet]) => {
    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkSemverRule(dependenciesInstalled, dependency, rule, cliOptions);
      });

      return;
    }

    checkSemverRule(dependenciesInstalled, dependency, ruleSet, cliOptions);
  });
};
