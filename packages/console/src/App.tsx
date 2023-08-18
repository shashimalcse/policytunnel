import ReactFlow, {
  Background, MiniMap,
  Controls, BackgroundVariant, ReactFlowProvider
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import { CodeBlock } from "react-code-blocks";
import { PathType, getRegoPolicy } from "@policytunnel/core/src/policy_handler/convertor";
import './App.css'
import 'reactflow/dist/style.css';
import { useState, useCallback, useEffect } from 'react';
import IfBlock from './nodes/if_block';
import StartBlock from './nodes/start_block';
import EndBlock from './nodes/end_block';
import ElseBlock from './nodes/else_block';
import ThenBlock from './nodes/then_block';
import PassBlock from './nodes/pass_block';
import FailBlock from './nodes/fail_block';
import {BlockType} from './components/action_bar';
import ActionBar from './components/action_bar';

const nodeTypes = {
  ifBlock: IfBlock,
  elseBlock: ElseBlock,
  startBlock: StartBlock,
  endBlock: EndBlock,
  thenBlock: ThenBlock,
  passBlock: PassBlock,
  failBlock: FailBlock
};

import useStore from './store';

const selector = (state: { nodes: any; edges: any; onNodesChange: any; onEdgesChange: any; onConnect: any; addNode: any; addEdge: any; removeNode:any }) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
  addEdge: state.addEdge,
  removeNode: state.removeNode
});

const edgeOptions = {
  animated: true,
  style: {
    stroke: 'black',
  },
};

class Graph {
  public nodes: Node[] = [];
  public nextNodeId: number = 1;

  constructor() {
    // Create initial start and end nodes
    const startNode: Node = {
      id: this.nextNodeId,
      type: 'startBlock',
      connectedNodeIds: []
    };
    this.nextNodeId++;
    const endNode: Node = {
      id: this.nextNodeId,
      type: 'endBlock',
      connectedNodeIds: []
    };
    this.nextNodeId++;

    this.nodes.push(startNode, endNode);
  }

  getNode(id: number): Node | undefined {

    return this.nodes.find(node => node.id === id);
  };

  addNode(type: string): number {
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

  addChildNode(parentNodeId: number, type: string): number {
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

interface Node {
  id: number;
  type: string;
  connectedNodeIds: number[];
}

function App() {

  const [graph, setGraph] = useState(new Graph());

  const handleAddChildNode = (parentNodeId: number, type: string) : number => {
    const newChildNodeId = graph.addChildNode(parentNodeId, type);
    const newGraph = new Graph();
    newGraph.nodes = graph.nodes;
    newGraph.nextNodeId = graph.nextNodeId
    setGraph(newGraph);
    return newChildNodeId;
  };

  const handleDeleteNode = (nodeId: number) => {
    graph.deleteNode(nodeId);
    const newGraph = new Graph();
    newGraph.nodes = graph.nodes;
    newGraph.nextNodeId = graph.nextNodeId
    setGraph(newGraph);
  };


  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, addEdge, removeNode } = useStore(selector, shallow);
  const [selectedNode, setSelectedNode] = useState<any>();

  const removeNodeandEdges = (id :number) => {
    const node = graph.getNode(id)
    if (node) {
  
      const nodesToDelete: number[] = [node.id];
      const stack: number[] = [node.id];
  
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        const currentNode = graph.nodes.find(node => node.id === currentId)!;
  
        nodesToDelete.push(...currentNode.connectedNodeIds);
  
        stack.push(...currentNode.connectedNodeIds);
      }

      for (var nodeId of nodesToDelete) {
        removeNode(nodeId.toString())
      }
      
      handleDeleteNode(id)
      if (node.type == "ifBlock") {
        removeNodeandEdges(id+2)
      }
    } else {
      console.log("Node not found!")
    }
  }

  const addConditionalBlock = (blockType: BlockType) => {
    if (!selectedNode) {
      return
    }
    const selectedNodeId: number = +selectedNode.id
    switch (blockType) {
      case (BlockType.CONDITIONAL) : {
        if(selectedNode.type == 'thenBlock' || selectedNode.type == 'elseBlock' || selectedNode.type == 'startBlock') {
          const ifBlockId = handleAddChildNode(selectedNodeId, 'ifBlock');
          const ifBlock = {
            id: ifBlockId.toString(),
            type: 'ifBlock',
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y - 200 }, data: {
              remove : removeNodeandEdges
            }
          };
          const thenBlockId: number = handleAddChildNode(ifBlockId, 'thenBlock');
          const thenBlock = {
            id: thenBlockId.toString(),
            type: 'thenBlock',
            position: { x: ifBlock.position.x + 300, y: ifBlock.position.y + 100 }, data: null
          };
          const elseBlockId: number = handleAddChildNode(selectedNodeId, 'elseBlock');
          const elseBlock = {
            id: elseBlockId.toString(),
            type: 'elseBlock',
            position: { x: ifBlock.position.x + 50, y: selectedNode.position.y + 100 }, data: null
          };
          addNode(ifBlock);
          addNode(thenBlock);
          addNode(elseBlock);
          addEdge({ id: 'e' + selectedNodeId.toString() + '-' + ifBlockId.toString(), source: selectedNodeId.toString(), target: ifBlockId.toString() })
          addEdge({ id: 'e' + selectedNodeId.toString() + '-' + elseBlockId.toString(), source: selectedNodeId.toString(), target: elseBlockId.toString() })
          addEdge({ id: 'e' + ifBlockId.toString() + '-' + thenBlockId.toString(), source: ifBlockId.toString(), target: thenBlockId.toString() })
        }
        break
      }

      case (BlockType.FAIL) : {
        if(selectedNode.type == 'thenBlock' || selectedNode.type == 'elseBlock') {
          const failBlockId: number = handleAddChildNode(selectedNodeId, 'failBlock');
          const failBlock = {
            id: failBlockId.toString(),
            type: 'failBlock',
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y }, data: null
          };
          addNode(failBlock);
          addEdge({ id: 'e' + selectedNodeId.toString() + '-' + failBlockId.toString(), source: selectedNodeId.toString(), target: failBlockId.toString() })
          addEdge({ id: 'e' + failBlockId.toString() + '-' + '2', source: failBlockId.toString(), target: '2' })
        }
        break
      }

      case (BlockType.PASS) : {
        if(selectedNode.type == 'thenBlock' || selectedNode.type == 'elseBlock') {
          const passBlockId: number = handleAddChildNode(selectedNodeId, 'passBlock');
          const passBlock = {
            id: passBlockId.toString(),
            type: 'passBlock',
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y }, data: null
          };
          addNode(passBlock);
          addEdge({ id: 'e' + selectedNodeId.toString() + '-' + passBlockId.toString(), source: selectedNodeId.toString(), target: passBlockId.toString() })
          addEdge({ id: 'e' + passBlockId.toString() + '-' + '2', source: passBlockId.toString(), target: '2' })
        }
        break
      }
    }
    setSelectedNode(null)
  };

  return (
      <div>

        <div className="h-screen w-screen flex justify-center items-center">
          <ReactFlow className="bg-gray-200" nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} defaultEdgeOptions={edgeOptions}   onNodeClick={(event, node) => {
          if (node?.id) {
            setSelectedNode(node)
          }
        }}>
            <Background variant={BackgroundVariant.Dots} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <div className="w-1/6 fixed top-5 left-5 bottom-40 rounded-lg bg-white">
          <ActionBar addConditionalBlock={addConditionalBlock}/>
        </div>
        {/* <div className="w-2/6 fixed top-5 right-5 bottom-[200px] rounded-lg bg-white">
        <button onClick={handleButtonClick}>Genarate OPA policy</button>
        <CodeBlock
          text={result}
          language='javascript'
          showLineNumbers={false}
          startingLineNumber={10} wrapLongLines={false}
        />
      </div> */}

        {/* Main Content */}
      </div>
  )
}

export default App

