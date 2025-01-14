import chalk from "chalk";
import { satisfies } from "semver";

import type { DependencyMap } from "../utils/get-dependency-map";
import type { WhitelistConfig } from "../utils/get-whitelist-config";

export const semverChecker = (
  dependencyMap: DependencyMap,
  whitelistConfig: WhitelistConfig
): void => {
  for (const [dependency, [version, reason]] of Object.entries(
    whitelistConfig
  )) {
    const dependencyValue = dependencyMap.get(dependency);

    if (!dependencyValue) {
      continue;
    }

    if (
      dependencyValue.rootVersion &&
      satisfies(dependencyValue.rootVersion, version)
    ) {
      return;
    }

    console.log(
      chalk.red(
        `${dependency}@${
          dependencyValue.rootVersion
        } does not satisfy ${dependency}@${version}\n\tReason: ${chalk.italic(
          reason
        )}`
      )
    );
  }
};
