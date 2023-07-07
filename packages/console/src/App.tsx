import ReactFlow, {
  Background, MiniMap,
  Controls, BackgroundVariant
} from 'reactflow';
import { CodeBlock } from "react-code-blocks";
import { PathType, getRegoPolicy } from "@policytunnel/core/src/policy_handler/convertor";
import './App.css'
import 'reactflow/dist/style.css';
import { useState } from 'react';

function App() {

  const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  ];
  const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
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
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '70vw'}}>
        <ReactFlow nodes={initialNodes} edges={initialEdges}>
          <Background color="#FFFFFF" variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <div style={{ width: '30vw', backgroundColor: 'white' }}>
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
