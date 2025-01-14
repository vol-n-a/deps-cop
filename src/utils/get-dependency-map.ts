import type { Dependency, Project } from "./get-dependency-tree";

const dependencyMap = new Map<
  string,
  {
    rootVersion?: string;
    versions: Record<string, Array<string>>;
  }
>();

export type DependencyMap = typeof dependencyMap;

export const getDependencyMap = (
  tree: Project | Dependency,
  path: Array<string> = []
): DependencyMap => {
  if (!tree.dependencies) {
    return dependencyMap;
  }

  for (const [dependencyName, dependencyTree] of Object.entries(
    tree.dependencies
  )) {
    const rootVersion = path.length === 0 ? dependencyTree.version : void 0;
    const dependencyPath = [...path, dependencyName];

    let dependencyValue = dependencyMap.get(dependencyName);

    if (!dependencyValue) {
      dependencyValue = {
        rootVersion,
        versions: {},
      };
      dependencyMap.set(dependencyName, dependencyValue);
    }

    // If root version of a current dependency is found, save it
    if (!dependencyValue.rootVersion && rootVersion) {
      dependencyValue.rootVersion = rootVersion;
    }

    // Save dependency version with its tree path
    dependencyValue.versions[dependencyTree.version] = dependencyPath;

    // Check dependencies of a currebt dependency
    getDependencyMap(dependencyTree, dependencyPath);
  }

  return dependencyMap;
};
