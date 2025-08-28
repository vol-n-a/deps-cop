import type { Project } from "./get-dependency-tree.js";

export type DependenciesInstalled = Map<string, string>;

/**
 * Extracts the direct dependencies from the project's dependency tree and returns a map of dependency names to their installed versions.
 *
 * @param tree The root node of the project's dependency tree.
 * @returns A map where each key is a dependency name and each value is the installed version.
 */
export const getDependenciesInstalled = (
  tree: Project
): DependenciesInstalled => {
  const dependenciesInstalled: DependenciesInstalled = new Map();

  if (!tree.dependencies) {
    return dependenciesInstalled;
  }

  for (const [dependencyName, { version }] of Object.entries(
    tree.dependencies
  )) {
    dependenciesInstalled.set(dependencyName, version);
  }

  return dependenciesInstalled;
};
