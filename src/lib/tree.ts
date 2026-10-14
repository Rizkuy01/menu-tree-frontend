import type { MenuNode } from "@/types/menu";

export function findNode(nodes: MenuNode[], id: string): MenuNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export function findParent(nodes: MenuNode[], id: string): MenuNode | null {
  for (const node of nodes) {
    if (node.children.some((child) => child.id === id)) return node;
    const found = findParent(node.children, id);
    if (found) return found;
  }
  return null;
}

export function collectIds(node: MenuNode): string[] {
  return [node.id, ...node.children.flatMap(collectIds)];
}

export function countDescendants(node: MenuNode): number {
  return collectIds(node).length - 1;
}

export function isInSubtree(root: MenuNode, targetId: string): boolean {
  return collectIds(root).includes(targetId);
}

export function filterTree(
  root: MenuNode,
  query: string,
): { tree: MenuNode | null; expandIds: Set<string> } {
  const q = query.trim().toLowerCase();
  if (!q) return { tree: root, expandIds: new Set() };

  const expandIds = new Set<string>();
  const walk = (node: MenuNode): MenuNode | null => {
    const children = node.children
      .map(walk)
      .filter((child): child is MenuNode => child !== null);
    const matches = node.name.toLowerCase().includes(q);
    if (!matches && children.length === 0) return null;
    if (children.length > 0) expandIds.add(node.id);
    return { ...node, children: children.length > 0 ? children : node.children };
  };

  return { tree: walk(root), expandIds };
}
