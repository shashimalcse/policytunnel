import { BlockType } from "../graph_processor/constants/block_types";
import Graph, { IfNodeProperties } from "src/graph_processor/graph";
import { PathNode } from "src/graph_processor/path_finder";

const oppositeOperators: Record<string, string> = {
    "equal": "not_equal",
    "not_equal": "equal",
    "contains": "not_contains",
    "not_contains": "contains",
    "contain_at_least_one": "not_contain_at_least_one",
    "not_contain_at_least_one": "contain_at_least_one"
};

export function getTunnelPolicy(graph: Graph, paths: PathNode[][]): string {

    const allPathsProperties: IfNodeProperties[][] = [];

    for (const path of paths) {
        const currentPathProperties: IfNodeProperties[] = [];
        
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (node.type === BlockType.IF) {
                const nodeToExecute = graph.nodes.find(n => n.id === node.nodeId);
                
                if (nodeToExecute?.properties) {
                    const properties: IfNodeProperties = nodeToExecute.properties as IfNodeProperties;
                    if (isNegativeCondition(path[i+1])) {
                        currentPathProperties.push(getNegativeProperties(properties));
                    } else {
                        currentPathProperties.push(properties);
                    }
                }
            }
        }

        allPathsProperties.push(currentPathProperties);
    }

    return JSON.stringify(allPathsProperties, null, 2);
}


function isNegativeCondition(node: PathNode): boolean {
    
    if (node.type == BlockType.ELSE) {
        return true
    }
    return false
}

function getNegativeProperties(properties: IfNodeProperties) : IfNodeProperties {

    const oppositeOperator = oppositeOperators[properties.operator];

    if (!oppositeOperator) {
        throw new Error(`Invalid operator: ${properties.operator}`);
    }

    return {
        ...properties,
        operator: oppositeOperator
    };
}
