import ReactFlow, {
  Background, MiniMap,
  Controls, BackgroundVariant, applyEdgeChanges, applyNodeChanges, addEdge, Node, Edge, OnConnect, OnEdgesChange, OnNodesChange
} from 'reactflow';
import { CodeBlock } from "react-code-blocks";
import { PathType, getRegoPolicy } from "@policytunnel/core/src/policy_handler/convertor";
import './App.css'
import 'reactflow/dist/style.css';
import { useState, useCallback } from 'react';
import IfBlock from './nodes/if_block';
import StartBlock from './nodes/start_block';
import EndBlock from './nodes/end_block';

const nodeTypes = {
  ifBlock: IfBlock,
  startBlock: StartBlock,
  endBlock: EndBlock
};

const initialNodes: Node[] = [
  { id: '1', type: 'startBlock', position: { x: 100, y: 50 }, data: null},
  { id: '2', type: 'endBlock', position: { x: 650, y: 25 }, data: null},
  {
    id: '3',
    type: 'ifBlock',
    position: { x: 300, y: 50 }, data: null
  },
];
const initialEdges:Edge[] = [];

const edgeOptions = {
  animated: true,
  style: {
    stroke: 'white',
  },
};

function App() {

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

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
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  const handleButtonClick = () => {
    // Function logic goes here
    const output = getRegoPolicy(jsonString, PathType.Allow)
    setResult(output);
  };
  return (
    <div className='flex h-screen'>
      <div className='w-4/5 bg-gray-900'>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} defaultEdgeOptions={edgeOptions}>
          <Background color="#FFFFFF" variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <div className='w-1/5'>
        <button onClick={handleButtonClick}>Genarate OPA policy</button>
        <CodeBlock
          text={result}
          language='javascript'
          showLineNumbers={false}
          startingLineNumber={10} wrapLongLines={false}        
        />
      </div>
    </div>
  )
}

export default App
