import { program } from "commander";

import packageJSON from "../package.json" with {type: "json"};
import { runCheckers } from "./checkers/index.js";

program
  .name("deps-cop")
  .version(packageJSON.version)
  .description("DepsCop - whitelist for package.json dependencies");

program.parse();

void runCheckers();
