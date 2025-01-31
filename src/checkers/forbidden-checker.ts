import chalk from "chalk";
import { satisfies } from "semver";

import type { DependencyMap } from "../utils/get-dependency-map";
import type { ForbiddenRules } from "../utils/get-depscop-config";

export const forbiddenChecker = (
  dependencyMap: DependencyMap,
  forbiddenRules: ForbiddenRules
): void => {
  for (const [dependency, [version, reason]] of Object.entries(
    forbiddenRules
  )) {
    const dependencyValue = dependencyMap.get(dependency);

    // If the dependency from config is not installed, skip it
    if (!dependencyValue) {
      continue;
    }

    // If any version of the dependency from config is forbidded, report the error
    if (version === "any") {
      console.log(
        chalk.red(
          `forbidden: ${dependency} is not allowed\n\tReason: ${chalk.italic(
            reason
          )}`
        )
      );

      continue;
    }

    // If the dependency from config does not satisfy the rule, skip
    if (
      dependencyValue.rootVersion &&
      !satisfies(dependencyValue.rootVersion, version)
    ) {
      continue;
    }

    // Report the error
    console.log(
      chalk.red(
        `forbidden: ${dependency}@${
          dependencyValue.rootVersion
        } is not allowed\n\tReason: ${chalk.italic(reason)}`
      )
    );
  }
};
