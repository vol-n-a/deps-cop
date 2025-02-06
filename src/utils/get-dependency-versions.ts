import type { ExecException } from "node:child_process";
import { exec } from "node:child_process";

/**
 * Returns an array of all `packageName`'s versions existing in npm registry (including prerelease versions)
 *
 * @param packageName package name
 * @returns array of all versions existing in npm registry
 */
export const getDependencyVersions = async (
  packageName: string
): Promise<Array<string>> => {
  const versions = await new Promise<string>((resolve, reject) =>
    exec(
      `npm view ${packageName} versions --json`,
      (error: ExecException | null, stdout: string) => {
        if (error && !error.stdout?.includes("ELSPROBLEMS")) {
          reject(error);
        }

        resolve(stdout);
      }
    )
  );

  return JSON.parse(versions) as Array<string>;
};
