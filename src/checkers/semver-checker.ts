import { satisfies } from "semver";

import type { DependenciesInstalled } from "src/shared/utils/get-dependencies-installed.js";
import { isArrayOfArrays } from "src/shared/utils/type-guards/is-array-of-arrays.js";

import type { CliOptions } from "../command.js";
import type {
  DependencyName,
  SemverRule,
  SemverRuleset,
} from "../config/index.js";
import { Severity } from "../config/index.js";
import { SemverRuleViolation, stats } from "../stats/index.js";

const checkSemverRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependency: DependencyName,
  [version, reason, ruleOptions]: SemverRule,
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
        severity: ruleOptions?.severity,
      }
    )
  );
};

export const semverChecker = (
  dependenciesInstalled: DependenciesInstalled,
  semverRuleset: SemverRuleset,
  cliOptions: CliOptions
): void => {
  Object.entries(semverRuleset).forEach(([dependency, ruleSet]) => {
    if (isArrayOfArrays(ruleSet)) {
      ruleSet.forEach((rule) => {
        checkSemverRule(dependenciesInstalled, dependency, rule, cliOptions);
      });

      return;
    }

    checkSemverRule(dependenciesInstalled, dependency, ruleSet, cliOptions);
  });
};
