import { Severity } from "./build/index.js";

const config = {
  recent: {
    typescript: ["5.-1", "recent lol", { severity: Severity.ERROR }],
  },
  forbidden: {
    chalk: ["any", "hahah forbidden", { severity: Severity.WARNING }],
  },
  semver: {
    globals: ["15.15.x", "asdasdasdas"],
  },
};

export default config;
