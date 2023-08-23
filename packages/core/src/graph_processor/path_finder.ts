import Graph from "./graph";

export interface PathNode {
    nodeId: number;
    type: string;
}

export function findPaths(graph: Graph, startNodeId: number, endNodeType: string): PathNode[][] {
    const paths: PathNode[][] = [];
    const visited: Set<number> = new Set();

    function dfs(nodeId: number, currentPath: PathNode[]) {
        visited.add(nodeId);
        const node = graph.nodes.find(node => node.id === nodeId);

        if (node) {
            const pathNode: PathNode = { nodeId, type: node.type };
            currentPath.push(pathNode);

            if (node.type === endNodeType) {
                paths.push([...currentPath]);
            } else {
                for (const connectedNodeId of node.connectedNodeIds) {
                    if (!visited.has(connectedNodeId)) {
                        dfs(connectedNodeId, currentPath);
                    }
                }
            }

            currentPath.pop();
        }

        visited.delete(nodeId);
    }

    dfs(startNodeId, []);

    return paths;
}
