import { BlockType } from "../graph_processor/constants/block_types";
import Graph, { IfNodeProperties } from "src/graph_processor/graph";
import { PathNode } from "src/graph_processor/path_finder";


export function getOpaPolicy(graph: Graph, paths: PathNode[][]): string {

    const policies = [
        "package example",
        "import future.keywords.if",
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
                        opaConditions.push("    not " + properties.attribute.name + "_" + properties.operator)
                    } else {
                        opaConditions.push("    " + properties.attribute.name + "_" + properties.operator)
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
   
    let opaCondition: string = "";
    switch (properties.operator) {
        case "equal": {
            opaCondition = properties.attribute.name + "_" + properties.operator + " if input." + properties.attribute.name + " == \"" + properties.value + "\"";
            break;
        }
        case "notEqual": {
            opaCondition = properties.attribute.name + "_" + properties.operator + " if input." + properties.attribute.name + " != \"" + properties.value + "\"";
            break;
        }
    }
    return opaCondition
 }
