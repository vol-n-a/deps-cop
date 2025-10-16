import { satisfies, validRange } from "semver";

import type {
  AllowedRule,
  AllowedRuleset,
  DependencyName,
} from "src/config/index.js";
import { Severity } from "src/config/index.js";

import { stats } from "../../../stats/index.js";
import type { DependenciesInstalled } from "../../utils/index.js";
import { isArrayOfArrays } from "../utils/index.js";
import type { CheckAllowedRuleOptions } from "./model/index.js";
import { AllowedRuleViolation } from "./model/index.js";

const checkAllowedRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependencyName: DependencyName,
  [versionRequired, reason, ruleOptions]: AllowedRule,
  options: CheckAllowedRuleOptions
): void => {
  // If required version is not a valid semver range, throw an error
  if (!validRange(versionRequired)) {
    throw new Error(
      `Invalid semver range "${versionRequired}" in Allowed ruleset. Only valid semver ranges are allowed.`
    );
  }

  const dependencyVersion = dependenciesInstalled.get(dependencyName);

  // Skip rule check if severity is WARNING and quiet mode is enabled
  if (ruleOptions?.severity === Severity.WARNING && options.quiet) {
    return;
  }

  // If the dependency from config is not installed, skip it
  if (!dependencyVersion) {
    return;
  }

  // If the installed dependency satisfies the rule, skip
  if (dependencyVersion && satisfies(dependencyVersion, versionRequired)) {
    return;
  }

  // Report the error
  stats.addRuleViolation(
    new AllowedRuleViolation(
      `${dependencyName}@${dependencyVersion} does not satisfy ${dependencyName}@${versionRequired}`,
      {
        reason,
        severity: ruleOptions?.severity,
      }
    )
  );
};

export const checkAllowedRules = (
  dependenciesInstalled: DependenciesInstalled,
  allowedRuleset: AllowedRuleset,
  options: CheckAllowedRuleOptions
): void => {
  Object.entries(allowedRuleset).forEach(([dependency, ruleSet]) => {
    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkAllowedRule(dependenciesInstalled, dependency, rule, options);
      });

      return;
    }

    checkAllowedRule(dependenciesInstalled, dependency, ruleSet, options);
  });
};
