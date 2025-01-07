import type { Dependency, Project } from "./get-dependency-tree";

const dependencyMap = new Map<string, Record<string, Array<string>>>();

export const getDependencyMap = (
  dependencyTree: Project | Dependency,
  path: Array<string> = []
): typeof dependencyMap => {
  if (!dependencyTree.dependencies) {
    return dependencyMap;
  }

  if ("name" in dependencyTree) {
    dependencyMap.set(dependencyTree.name, { [dependencyTree.version]: [] });
  }

  for (const [dependencyName, dependencySubTree] of Object.entries(
    dependencyTree.dependencies
  )) {
    const versionMap = dependencyMap.get(dependencyName) ?? {};
    const subPath = [...path, dependencyName];

    versionMap[dependencySubTree.version] = subPath;

    dependencyMap.set(dependencyName, versionMap);
    getDependencyMap(dependencySubTree, subPath);
  }

  return dependencyMap;
};
