import { BlockType } from "./constants/block_types";
import Graph, { IfNodeProperties } from "./graph";
import { PathNode } from "./path_finder";

export function executePaths(input: string, graph: Graph, paths: PathNode[][]): boolean {
    const json = JSON.parse(input);


    for (const path of paths) {
        let allConditionsMet = true;
        // We assume all conditions are met until proven otherwise
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (node.type === BlockType.IF) {
                const nodeToExecute = graph.nodes.find(n => n.id === node.nodeId);
                if (!nodeToExecute?.properties) {
                    allConditionsMet = false;
                } else {
                    const properties: IfNodeProperties = nodeToExecute?.properties as IfNodeProperties;
                    const inputValue = getValueFromInput(json, properties.attribute.name);
                    const isNeg = isNegativeCondition(path[i+1])
                    if (isNeg) {
                        switch (properties.operator) {
                            case "equal":
                                if (inputValue === properties.value) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "not_equal":
                                if (inputValue !== properties.value) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "contains":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (values.every(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "not_contains":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (!values.every(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "contain_at_least_one":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (values.some(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "not_contain_at_least_one":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (!values.some(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            default:
                                allConditionsMet = false;
                                break;
                    }
                    } else {
                        switch (properties.operator) {
                            case "equal":
                                if (inputValue !== properties.value) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "not_equal":
                                if (inputValue === properties.value) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "contains":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (!values.every(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "not_contains":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (values.every(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "contain_at_least_one":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (!values.some(elementA => inputValues.includes(elementA))) {
                                    allConditionsMet = false;
                                    break;
                                }
                                break;
                            case "not_contain_at_least_one":
                                var values: string[] = Array.isArray(properties.value) ? properties.value : [];
                                var inputValues: string[] = Array.isArray(inputValue) ? inputValue : [];
                                if (values.some(elementA => inputValues.includes(elementA))) {
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
        }
        if (allConditionsMet) {
            return true;
        }
    }

    return false;
}

function getValueFromInput(input: any, attributeName: string): string | string[] | undefined {
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

function isNegativeCondition(node: PathNode): boolean {
    
    if (node.type == BlockType.ELSE) {
        return true
    }
    return false
}
