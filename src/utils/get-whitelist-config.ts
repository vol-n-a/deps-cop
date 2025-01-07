import { readFile, readFileSync } from "fs";
import path from "path";
import { promisify } from "util";

type Version = string;
type Reason = string;

export type WhitelistConfig = Record<string, [Version, Reason]>;

const whitelistConfigPath = path.resolve(process.cwd(), "whitelist.json");

export const getWhitelistConfig = async (): Promise<WhitelistConfig> => {
  const readFilePromise = promisify(readFile);

  const file = await readFilePromise(whitelistConfigPath, "utf-8");

  return JSON.parse(file) as WhitelistConfig;
};
