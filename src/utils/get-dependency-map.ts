import type { DependencyNode, Project } from "./npm/get-dependency-tree.js";

const dependenciesInstalled = new Map<
  string,
  {
    rootVersion?: string;
    versions: Record<string, Array<string>>;
  }
>();

export type DependenciesInstalled = typeof dependenciesInstalled;

/**
 * Traverses the dependency tree and collects data about entries into a map
 *
 * Data collected:
 * - Dependency name
 * - Whether the dependency is root one or not (is it present in the project's package.json)
 * - Dependency version
 * - Paths to the specific dependency version through the nodes (if there are several version entries, function saves paths to all of them)
 *
 * @param tree Current node of the project's dependency tree
 * @param path Path to the current node of the project's dependency tree
 * @returns Dependency map
 */
export const getDependeniesInstalled = (
  tree: Project | DependencyNode,
  path: Array<string> = []
): DependenciesInstalled => {
  if (!tree.dependencies) {
    return dependenciesInstalled;
  }

  for (const [dependencyName, dependencyTree] of Object.entries(
    tree.dependencies
  )) {
    const rootVersion = path.length === 0 ? dependencyTree.version : void 0;
    const dependencyPath = [...path, dependencyName];

    let dependencyValue = dependenciesInstalled.get(dependencyName);

    if (!dependencyValue) {
      dependencyValue = {
        rootVersion,
        versions: {},
      };
      dependenciesInstalled.set(dependencyName, dependencyValue);
    }

    // If root version of a current dependency is found, save it
    if (!dependencyValue.rootVersion && rootVersion) {
      dependencyValue.rootVersion = rootVersion;
    }

    // Save dependency version with its tree path
    dependencyValue.versions[dependencyTree.version] = dependencyPath;

    // Traverse dependencies of a current dependency
    getDependeniesInstalled(dependencyTree, dependencyPath);
  }

  return dependenciesInstalled;
};
