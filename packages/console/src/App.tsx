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

function App() {

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, addEdge, removeNode } = useStore(selector, shallow);
  const [selectedNodeId, setSelectedNodeId] = useState<any>(1);
  const [selectedNode, setSelectedNode] = useState<any>();

  const addConditionalBlock = (blockType: BlockType) => {
    if (!selectedNode) {
      return
    }
    switch (blockType) {
      case (BlockType.CONDITIONAL) : {
        if(selectedNode.type == 'thenBlock' || selectedNode.type == 'elseBlock' || selectedNode.type == 'startBlock') {
          const ifBlockId: number = selectedNodeId + 1;
          const ifBlock = {
            id: ifBlockId,
            type: 'ifBlock',
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y - 200 }, data: null
          };
          const thenBlockId: number = selectedNodeId + 2;
          const thenBlock = {
            id: thenBlockId,
            type: 'thenBlock',
            position: { x: ifBlock.position.x + 300, y: ifBlock.position.y + 100 }, data: null
          };
          const elseBlockId: number = selectedNodeId + 3;
          const elseBlock = {
            id: elseBlockId,
            type: 'elseBlock',
            position: { x: ifBlock.position.x + 50, y: selectedNode.position.y + 100 }, data: null
          };
          addNode(ifBlock);
          addNode(thenBlock);
          addNode(elseBlock);
          addEdge({ id: 'e' + selectedNodeId + '-' + ifBlockId, source: selectedNodeId, target: ifBlockId })
          addEdge({ id: 'e' + selectedNodeId + '-' + elseBlockId, source: selectedNodeId, target: elseBlockId })
          addEdge({ id: 'e' + ifBlockId + '-' + thenBlockId, source: ifBlockId, target: thenBlockId })
          setSelectedNodeId(selectedNodeId + 4)
        }
        break
      }

      case (BlockType.FAIL) : {
        if(selectedNode.type == 'thenBlock' || selectedNode.type == 'elseBlock') {
          const failBlockId: number = selectedNodeId + 1;
          const failBlock = {
            id: failBlockId,
            type: 'failBlock',
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y }, data: null
          };
          addNode(failBlock);
          addEdge({ id: 'e' + selectedNodeId + '-' + failBlock, source: selectedNodeId, target: failBlockId })
          addEdge({ id: 'e' + failBlockId + '-' + '2', source: failBlockId, target: '2' })
        }
        break
      }

      case (BlockType.PASS) : {
        if(selectedNode.type == 'thenBlock' || selectedNode.type == 'elseBlock') {
          const passBlockId: number = selectedNodeId + 1;
          const passBlock = {
            id: passBlockId,
            type: 'passBlock',
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y }, data: null
          };
          addNode(passBlock);
          addEdge({ id: 'e' + selectedNodeId + '-' + passBlock, source: selectedNodeId, target: passBlockId })
          addEdge({ id: 'e' + passBlockId + '-' + '2', source: passBlockId, target: '2' })
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
            setSelectedNodeId(node.id)
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

