#!/usr/bin/env node

import { program } from "commander";

import type { CliOptions } from "./model/types.js";
import { runCheckers } from "./run-checkers/index.js";
import { stats } from "./stats/stats.js";

program
  .name("deps-cop")
  .description("DepsCop - whitelist for package.json dependencies")
  .option("--allow-prerelease", "enables including", false)
  .option("--prod", "disables dev dependencies checking", false)
  .option("--quiet", "disable reporting on warnings", false);

program.parse();

const cliOptions = program.opts<CliOptions>();

stats.init(cliOptions);

void runCheckers(cliOptions);
