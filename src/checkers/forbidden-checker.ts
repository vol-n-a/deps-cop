import { satisfies } from "semver";

import type { Options } from "../command.js";
import { ForbiddenRuleViolation, stats } from "../stats/index.js";
import {
  type DependencyName,
  type ForbiddenRules,
  type Rule,
  Severity,
} from "../utils/config/types.js";
import type { DependenciesInstalled } from "../utils/get-dependencies-installed.js";
import { isArrayOfArrays } from "../utils/type-guards/is-array-of-arrays.js";

const checkForbiddenRule = (
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

  // If any version of the dependency from config is forbidden, report the error
  if (version === "any") {
    stats.addRuleViolation(
      new ForbiddenRuleViolation(`${dependency} is not allowed`, {
        reason,
        severity,
      })
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
      `${dependency}@${dependencyValue.rootVersion} is forbidden`,
      {
        reason,
        severity,
      }
    )
  );
};

export const forbiddenChecker = (
  dependenciesInstalled: DependenciesInstalled,
  forbiddenRules: ForbiddenRules,
  cliOptions: Options
): void => {
  Object.entries(forbiddenRules).forEach((forbiddenRulesEntry) => {
    const [dependency, ruleSet] = forbiddenRulesEntry;

    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkForbiddenRule(dependenciesInstalled, dependency, rule, cliOptions);
      });

      return;
    }

    checkForbiddenRule(dependenciesInstalled, dependency, ruleSet, cliOptions);
  });
};
