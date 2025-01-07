import { exec, type ExecException } from "node:child_process";

export type Project = {
  version: string;
  name: string;
  dependencies: Record<string, Dependency>;
};

export type Dependency = {
  version: string;
  dependencies?: Record<string, Dependency>;
};

export type Node = Project | Dependency;

export const getDependencyTree = async (): Promise<Project> => {
  const dependencyTree = await new Promise<string>((resolve, reject) =>
    exec("npm ls -a --json", (error: ExecException | null, stdout: string) => {
      if (error && !error.stdout?.includes("ELSPROBLEMS")) {
        // reject(error);
      }

      resolve(stdout);
    })
  );

  return JSON.parse(dependencyTree) as Project;
};
