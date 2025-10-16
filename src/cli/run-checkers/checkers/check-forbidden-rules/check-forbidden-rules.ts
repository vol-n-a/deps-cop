import { satisfies } from "semver";

import type {
  DependencyName,
  ForbiddenRule,
  ForbiddenRuleset,
} from "src/config/index.js";
import { Severity } from "src/config/index.js";

import { stats } from "../../../stats/index.js";
import type { DependenciesInstalled } from "../../utils/index.js";
import { isArrayOfArrays } from "../utils/index.js";
import type { CheckForbiddenRuleOptions } from "./model/index.js";
import { ForbiddenRuleViolation } from "./model/index.js";

const checkForbiddenRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependencyName: DependencyName,
  [versionRequired, reason, ruleOptions]: ForbiddenRule,
  options: CheckForbiddenRuleOptions
): void => {
  const dependencyVersion = dependenciesInstalled.get(dependencyName);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && options.quiet) {
    return;
  }

  // If the dependency from config is not installed, skip it
  if (!dependencyVersion) {
    return;
  }

  // If any version of the dependency from config is forbidden, report the error
  if (versionRequired === "any") {
    stats.addRuleViolation(
      new ForbiddenRuleViolation(`${dependencyName} is not allowed`, {
        reason,
        severity: ruleOptions?.severity,
      })
    );

    return;
  }

  // If the dependency from config does not satisfy the rule, skip
  if (dependencyVersion && !satisfies(dependencyVersion, versionRequired)) {
    return;
  }

  // Report the error
  stats.addRuleViolation(
    new ForbiddenRuleViolation(
      `${dependencyName}@${dependencyVersion} is forbidden`,
      {
        reason,
        severity: ruleOptions?.severity,
      }
    )
  );
};

export const checkForbiddenRules = (
  dependenciesInstalled: DependenciesInstalled,
  forbiddenRuleset: ForbiddenRuleset,
  options: CheckForbiddenRuleOptions
): void => {
  Object.entries(forbiddenRuleset).forEach((forbiddenRulesEntry) => {
    const [dependency, ruleSet] = forbiddenRulesEntry;

    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkForbiddenRule(dependenciesInstalled, dependency, rule, options);
      });

      return;
    }

    checkForbiddenRule(dependenciesInstalled, dependency, ruleSet, options);
  });
};
