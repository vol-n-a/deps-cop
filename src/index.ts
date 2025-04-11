import { program } from "commander";

import packageJSON from "../package.json" with { type: "json" };
import { runCheckers } from "./checkers/index.js";
import { stats } from "./stats/stats.js";

export type Options = {
  prod: boolean;
  quiet: boolean;
};

program
  .name("deps-cop")
  .version(packageJSON.version)
  .description("DepsCop - whitelist for package.json dependencies")
  .option("--prod", "disables dev dependencies checking", false)
  .option("--quiet", "disable reporting on warnings", false);

program.parse();

const options = program.opts<Options>();

stats.init(options);

void runCheckers(options);
