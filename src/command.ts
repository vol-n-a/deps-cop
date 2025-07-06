#!/usr/bin/env node

import { program } from "commander";

import packageJSON from "../package.json" with { type: "json" };
import { runCheckers } from "./checkers/index.js";
import { stats } from "./stats/stats.js";

// TODO: Rename to CliOptions
export type CliOptions = {
  allowPrerelease: boolean;
  prod: boolean;
  quiet: boolean;
};

program
  .name("deps-cop")
  .version(packageJSON.version)
  .description("DepsCop - whitelist for package.json dependencies")
  .option("--allow-prerelease", "enables including", false)
  .option("--prod", "disables dev dependencies checking", false)
  .option("--quiet", "disable reporting on warnings", false);

program.parse();

const cliOptions = program.opts<CliOptions>();

stats.init(cliOptions);

void runCheckers(cliOptions);
