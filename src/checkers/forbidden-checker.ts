import { satisfies } from "semver";

import { ForbiddenRuleViolation, stats } from "../stats/index.js";
import type { DependenciesInstalled } from "../utils/get-dependencies-installed.js";
import type {
  Dependency,
  ForbiddenRules,
  Rule,
} from "../utils/get-depscop-config.js";

const checkForbiddenRule = (
  dependenciesInstalled: DependenciesInstalled,
  dependency: Dependency,
  [version, reason]: Rule
): void => {
  const dependencyValue = dependenciesInstalled.get(dependency);

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
  dependenciesInstalled: DependenciesInstalled,
  forbiddenRules: ForbiddenRules
): void => {
  Object.entries(forbiddenRules).map(([dependency, rule]) =>
    checkForbiddenRule(dependenciesInstalled, dependency, rule)
  );
};
