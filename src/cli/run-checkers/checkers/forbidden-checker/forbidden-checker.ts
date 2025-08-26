import { satisfies } from "semver";

import type {
  DependencyName,
  ForbiddenRule,
  ForbiddenRuleset,
} from "src/config/index.js";
import { Severity } from "src/config/index.js";

import type { CliOptions } from "../../../model/index.js";
import { stats } from "../../../stats/index.js";
import type { DependenciesInstalled } from "../../utils/index.js";
import { isArrayOfArrays } from "../utils/index.js";
import { ForbiddenRuleViolation } from "./model/index.js";

const checkForbiddenRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependency: DependencyName,
  [version, reason, ruleOptions]: ForbiddenRule,
  cliOptions: CliOptions
): void => {
  const dependencyValue = dependenciesInstalled.get(dependency);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && cliOptions.quiet) {
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
        severity: ruleOptions?.severity,
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
        severity: ruleOptions?.severity,
      }
    )
  );
};

export const forbiddenChecker = (
  dependenciesInstalled: DependenciesInstalled,
  forbiddenRuleset: ForbiddenRuleset,
  cliOptions: CliOptions
): void => {
  Object.entries(forbiddenRuleset).forEach((forbiddenRulesEntry) => {
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
