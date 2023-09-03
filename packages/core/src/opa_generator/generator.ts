import { BlockType } from "../graph_processor/constants/block_types";
import Graph, { IfNodeProperties } from "src/graph_processor/graph";
import { PathNode } from "src/graph_processor/path_finder";


export function getOpaPolicy(graph: Graph, paths: PathNode[][]): string {

    const policies = [
        "package example",
        "import future.keywords",
        "",
        "default allow := false",
        ""
     ]

    for (const path of paths) {
        const opaConditions: string[] = [
            "",
            "allow {"
         ]
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (node.type === BlockType.IF) {
                const nodeToExecute = graph.nodes.find(n => n.id === node.nodeId);
                if (!nodeToExecute?.properties) {
                    continue
                } else {
                    
                    const properties: IfNodeProperties = nodeToExecute?.properties as IfNodeProperties;
                    const opaCondition = getOpaCondition(properties)
                    policies.push(opaCondition)
                    if (isNegativeCondition(path[i+1])) {
                        opaConditions.push("    not " + properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator)
                    } else {
                        opaConditions.push("    " + properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator)
                    }
                }
            }
        }
        opaConditions.push("}")
        const policyContent = opaConditions.join('\r\n');
        policies.push(policyContent)
    }

    const policiesContent = policies.join('\r\n');
    console.log(policiesContent)
    return policiesContent;
}

function isNegativeCondition(node: PathNode): boolean {
    
    if (node.type == BlockType.ELSE) {
        return true
    }
    return false
}

function getOpaCondition(properties: IfNodeProperties): string {
   
    let opaCondition = "";
    switch (properties.operator) {
        case "equal": {
            opaCondition = properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator + " if input." + properties.attribute.name + " == \"" + properties.value + "\"";
            break;
        }
        case "not_equal": {
            opaCondition = properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator + " if input." + properties.attribute.name + " != \"" + properties.value + "\"";
            break;
        }
        case "contains": {
            var values: string[] = Array.isArray(properties.value) ? properties.value : [];
            const valueList = `${properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator + "_list"} := {${values.map(value => `"${value}"`).join(", ")}}`;
            opaCondition = `${valueList}\n${properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator} if {\n` +
            `   every value in ${properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator + "_list"} {\n` +
            `    value in input.${properties.attribute.name}\n` +
            `   }\n` +
            `}`  ;
            break;
        }
        case "contain_at_least_one": {
            var values: string[] = Array.isArray(properties.value) ? properties.value : [];
            const valueList = `${properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator + "_list"} := {${values.map(value => `"${value}"`).join(", ")}}`;
            opaCondition = `${valueList}\n${properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator} if {\n` +
            `   some value in input.${properties.attribute.name} \n` +
            `       value in ${properties.attribute.name.replace(/\./g, "_") + "_" + properties.operator + "_list"}\n`+
            `}`;
            break;
        }
    }
    return opaCondition
 }
