import ReactFlow, {
  Background, MiniMap,
  Controls, BackgroundVariant, ReactFlowProvider
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import { CodeBlock } from "react-code-blocks";
import { PathType, getRegoPolicy } from "@policytunnel/core/src/policy_handler/convertor";
import './App.css'
import 'reactflow/dist/style.css';
import { useState, useCallback } from 'react';
import IfBlock from './nodes/if_block';
import StartBlock from './nodes/start_block';
import EndBlock from './nodes/end_block';
import ElseBlock from './nodes/else_block';
import ThenBlock from './nodes/then_block';
import PassBlock from './nodes/pass_block';
import FailBlock from './nodes/fail_block';
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

const selector = (state: { nodes: any; edges: any; onNodesChange: any; onEdgesChange: any; onConnect: any; addNode: any; addEdge: any; }) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
  addEdge: state.addEdge
});

const edgeOptions = {
  animated: true,
  style: {
    stroke: 'black',
  },
};

let nodeId = 3;

function App() {

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, addEdge } = useStore(selector, shallow);

  const jsonString = `{
    "validators":[
      {
          "name":"conditional",
          "conf":{
            "if":[
                {
                  "conf":{
                      "fields":[
                        {
                          "comparator":"equals",
                          "field":"authnCtx.username",
                          "value":"shashimal"
                        }
                      ]
                  },
                  "name":"context"
                }
            ],
            "then": {
                  "conf":{
                      "if":[
                        {
                            "conf":{
                              "fields":[
                                  {
                                    "comparator":"not_equals",
                                    "field":"authnCtx.gender",
                                    "value":"female"
                                  }
                              ]
                            },
                            "name":"context"
                        }
                      ],
                      "then":{
                            "conf":{
                              
                            },
                            "name":"false"
                      },
                      "else":{
                            "conf":{
                              
                            },
                            "name":"true"
                      }
                  },
                  "name":"conditional"
            },
            "else":{
                  "conf":{
                      
                  },
                  "name":"false"
            }
          }
      }
    ]
}`
  const [result, setResult] = useState('');
  const handleButtonClick = () => {
    // Function logic goes here
    const output = getRegoPolicy(jsonString, PathType.Allow)
    setResult(output);
  };

  const addConditionalBlock = () => {
    const ifBlockId = `${++nodeId}`;
    const ifBlock = {
      id: ifBlockId,
      type: 'ifBlock',
      position: { x: 250, y: 50 }, data: null
    };
    const thenBlockId = `${++nodeId}`;
    const thenBlock = {
      id: thenBlockId,
      type: 'thenBlock',
      position: { x: 650, y: 150 }, data: null
    };
    const elseBlockId = `${++nodeId}`;
    const elseBlock = {
      id: elseBlockId,
      type: 'elseBlock',
      position: { x: 350, y: 400 }, data: null
    };
    addNode(ifBlock);
    addNode(thenBlock);
    addNode(elseBlock);
    addEdge({ id: 'e' + 1 + '-' + ifBlockId, source: '1', target: ifBlockId })
    addEdge({ id: 'e' + 1 + '-' + elseBlockId, source: '1', target: elseBlockId })
    addEdge({ id: 'e' + ifBlockId + '-' + thenBlockId, source: ifBlockId, target: thenBlockId })
  };

  return (
      <div>

        <div className="h-screen w-screen flex justify-center items-center">
          <ReactFlow className="bg-gray-200" nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} defaultEdgeOptions={edgeOptions}>
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

