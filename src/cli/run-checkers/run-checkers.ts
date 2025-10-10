import { Listr } from "listr2";

import { readDepscopConfig } from "src/config/index.js";

import type { CliOptions } from "../model/index.js";
import { stats } from "../stats/index.js";
import {
  checkAllowedRules,
  checkForbiddenRules,
  recentChecker,
} from "./checkers/index.js";
import {
  getDependenciesInstalled,
  getDependencyTree,
  isNonNullable,
} from "./utils/index.js";

export const runCheckers = async (cliOptions: CliOptions): Promise<void> => {
  const { allowed, forbidden, recent } = await readDepscopConfig();

  const dependencyTree = await getDependencyTree(cliOptions);
  const dependenciesInstalled = getDependenciesInstalled(dependencyTree);

  // TODO: Remove this once depscop config resolver is implemented
  if (!allowed && !forbidden && !recent) {
    throw new Error("No rulesets found in DepsCop configuration");
  }

  const listr = new Listr(
    // TODO: Make checkers pluggable
    [
      allowed && {
        title: "Allowed rules check",
        task: () =>
          checkAllowedRules(dependenciesInstalled, allowed, cliOptions),
      },
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
