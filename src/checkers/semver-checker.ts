import chalk from "chalk";
import { satisfies } from "semver";

import type { DependencyMap } from "../utils/get-dependency-map";
import type { SemverRules } from "../utils/get-depscop-config";

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
  for (const [dependency, [version, reason]] of Object.entries(semverRules)) {
    const dependencyValue = dependencyMap.get(dependency);

    // If the dependency from config is not installed, skip it
    if (!dependencyValue) {
      continue;
    }

    // If the dependency from config satisfies the rule, skip
    if (
      dependencyValue.rootVersion &&
      satisfies(dependencyValue.rootVersion, version)
    ) {
      continue;
    }

    // Report the error
    console.log(
      chalk.red(
        `semver: ${dependency}@${
          dependencyValue.rootVersion
        } does not satisfy ${dependency}@${version}\n\tReason: ${chalk.italic(
          reason
        )}`
      )
    );
  }
};
