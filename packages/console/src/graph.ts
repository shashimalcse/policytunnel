import { BlockType } from "./constants/block_types";

export interface Node {
    id: number;
    type: BlockType;
    connectedNodeIds: number[];
}

class Graph {
    public nodes: Node[] = [];
    public nextNodeId: number = 1;
  
    constructor() {
      // Create initial start and end nodes
      const startNode: Node = {
        id: this.nextNodeId,
        type: BlockType.START,
        connectedNodeIds: []
      };
      this.nextNodeId++;
      const endNode: Node = {
        id: this.nextNodeId,
        type: BlockType.END,
        connectedNodeIds: []
      };
      this.nextNodeId++;
  
      this.nodes.push(startNode, endNode);
    }
  
    getNode(id: number): Node | undefined {
  
      return this.nodes.find(node => node.id === id);
    };
  
    addNode(type: BlockType): number {
      const newNode: Node = {
        id: this.nextNodeId,
        type: type,
        connectedNodeIds: []
      };
      this.nodes.push(newNode);
      this.nextNodeId++;
      return newNode.id;
    }
  
    deleteNode(nodeId: number): void {
      const nodeToDelete = this.nodes.find(node => node.id === nodeId);
  
      if (!nodeToDelete) {
        console.log("Node not found");
        return;
      }
  
      const nodesToDelete: number[] = [nodeId];
      const stack: number[] = [nodeId];
  
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        const currentNode = this.nodes.find(node => node.id === currentId)!;
  
        nodesToDelete.push(...currentNode.connectedNodeIds);
  
        stack.push(...currentNode.connectedNodeIds);
      }
  
      this.nodes = this.nodes.filter(node => !nodesToDelete.includes(node.id));
    }
  
    connectNodes(fromNodeId: number, toNodeId: number): void {
      const fromNode = this.nodes.find(node => node.id === fromNodeId);
      const toNode = this.nodes.find(node => node.id === toNodeId);
  
      if (!fromNode || !toNode) {
        console.log("Invalid node IDs");
        return;
      }
  
      fromNode.connectedNodeIds.push(toNodeId);
    }
  
    addChildNode(parentNodeId: number, type: BlockType): number {
      const parentNode = this.nodes.find(node => node.id === parentNodeId);
  
      if (!parentNode) {
        console.log("Parent node not found");
        return -1;
      }
  
      const childNodeId = this.addNode(type);
      this.connectNodes(parentNodeId, childNodeId);
  
      return childNodeId;
    }
  }

  export default Graph
