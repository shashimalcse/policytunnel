import { BlockType } from "./constants/block_types";
import Graph, { IfNodeProperties } from "./graph";
import { PathNode } from "./path_finder";

export function executePaths(input: string, graph: Graph, paths: PathNode[][]): boolean {
    const json = JSON.parse(input);


    for (const path of paths) {
        let allConditionsMet = true;
        // We assume all conditions are met until proven otherwise
        for (const node of path) {
            if (node.type === BlockType.IF) {
                const nodeToExecute = graph.nodes.find(n => n.id === node.nodeId);
                if (!nodeToExecute?.properties) {
                    allConditionsMet = false;
                } else {
                    const properties: IfNodeProperties = nodeToExecute?.properties as IfNodeProperties;
                    const inputValue = getValueFromInput(json, properties.attribute.name);

                    switch (properties.operator) {
                        case "equal":
                            if (inputValue !== properties.value) {
                                allConditionsMet = false;
                                break;
                            }
                            break;
                        case "notEqual":
                            if (inputValue === properties.value) {
                                allConditionsMet = false;
                                break;
                            }
                            break;
                        default:
                            allConditionsMet = false;
                            break;
                    }
                }
            }
        }
        if (allConditionsMet) {
            return true;
        }
    }

    return false;
}

function getValueFromInput(input: any, attributeName: string): any | undefined {
    try {

        const attributePath = attributeName.split('.');
        let value = input;

        for (const key of attributePath) {
            if (value && value.hasOwnProperty(key)) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return undefined;
    }
}
