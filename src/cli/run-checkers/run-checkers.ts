import { Listr } from "listr2";

import { readDepscopConfig } from "src/config/index.js";

import type { CliOptions } from "../model/index.js";
import { stats } from "../stats/index.js";
import {
  checkForbiddenRules,
  recentChecker,
  semverChecker,
} from "./checkers/index.js";
import {
  getDependenciesInstalled,
  getDependencyTree,
  isNonNullable,
} from "./utils/index.js";

export const runCheckers = async (cliOptions: CliOptions): Promise<void> => {
  const { forbidden, recent, semver } = await readDepscopConfig();

  const dependencyTree = await getDependencyTree(cliOptions);
  const dependenciesInstalled = getDependenciesInstalled(dependencyTree);

  // TODO: Remove this once depscop config resolver is implemented
  if (!forbidden && !recent && !semver) {
    throw new Error("No rulesets found in DepsCop configuration");
  }

  const listr = new Listr(
    // TODO: Make checkers pluggable
    [
      forbidden && {
        title: "Forbidden rules check",
        task: () =>
          checkForbiddenRules(dependenciesInstalled, forbidden, {
            quiet: cliOptions.quiet,
          }),
      },
      recent && {
        title: "Recent rules check",
        task: async () =>
          recentChecker(dependenciesInstalled, recent, cliOptions),
      },
      semver && {
        title: "Semver rules check",
        task: () => semverChecker(dependenciesInstalled, semver, cliOptions),
      },
    ].filter(isNonNullable),
    {
      concurrent: true,
    }
  );
  await listr.run();

  const { hasProblems } = stats.printProblems();

  if (hasProblems) {
    process.exit(1);
  }
};
