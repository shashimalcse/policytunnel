import ReactFlow, {
  Background, MiniMap,
  Controls, BackgroundVariant
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import './App.css'
import 'reactflow/dist/style.css';
import { useRef, useState } from 'react';
import IfBlock from './nodes/if_block';
import StartBlock from './nodes/start_block';
import EndBlock from './nodes/end_block';
import ElseBlock from './nodes/else_block';
import ThenBlock from './nodes/then_block';
import PassBlock from './nodes/pass_block';
import FailBlock from './nodes/fail_block';
import ActionBar from './components/action_bar';
import { ExtractAttributesFromInput } from "@policytunnel/shared/src/input_processor/input_loader";
import Editor from '@monaco-editor/react'
import CloseIcon from '@mui/icons-material/Close';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

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
import Graph from './graph';
import { BlockType } from './constants/block_types';
import { ControllerType } from './constants/controller';

const selector = (state: { nodes: any; edges: any; onNodesChange: any; onEdgesChange: any; onConnect: any; addNode: any; addEdge: any; removeNode: any }) => ({
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

  const initialInput = `{
    "authn_ctx": {
      "scp": [
        "openid",
        "profile",
        "email",
        "sample_service:read"
      ],
      "sub": "joe",
      "idp_id": "4abc18656e1d79589b6a6ba8afcb350a02623c6f5d39f43c3bcc47b697e92538",
      "groups": [
        "admins",
        "users"
      ],
      "email": "testjoe@cloudentity.com",
      "email_verified": true,
      "phone_number": "+1-555-6616-899",
      "phone_number_verified": "+1-555-6616-899",
      "address": {
        "formatted": "",
        "street_address": "1463  Perry Street",
        "locality": "Dayton",
        "region": "Kentucky",
        "country": "US",
        "postal_code": "41074"
      },
      "name": "Joe Test",
      "given_name": "Joe",
      "middle_name": "",
      "family_name": "Test",
      "nickname": "joe",
      "preferred_username": "testjoe",
      "profile": "",
      "picture": "",
      "website": "",
      "gender": "male",
      "birthdate": "1960-10-09",
      "zoneinfo": "",
      "locale": "",
      "updated_at": ""
    },
    "contexts": {
      "scopes": {
        "users.*": [
          {
            "params": [
              "joe"
            ],
            "requested_name": "users.joe"
          }
        ]
      },
      "workspaceMetadata": {
        "sap_id": "123456789"
      }
    },
    "request": {
      "headers": {
        "Content-Type": [
          "application/json"
        ],
        "X-Custom-Header": [
          "BOT_DETECTED"
        ]
      },
      "method": "POST",
      "path_params": {
        "users": "admins"
      },
      "query_params": {
        "limit": [
          "1000"
        ],
        "offset": [
          "100"
        ]
      },
      "path": "/doawesomethings"
    }
  }`

  const attributesArray = ExtractAttributesFromInput(initialInput);

  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge, removeNode } = useStore(selector, shallow);
  const [selectedNode, setSelectedNode] = useState<any>();
  const [input, setInput] = useState<string>(initialInput);
  const [inputEditorValue, setInputEditorValue] = useState<string>(initialInput);
  const [inputValidated, setInputValidated] = useState<boolean>(true);

  // This is the grpah we use to keep the nodes and later we will pass this for policy generation.
  const [graph, setGraph] = useState(new Graph());

  // Add child node to grpah.
  const handleAddChildNode = (parentNodeId: number, type: BlockType): number => {

    const newChildNodeId = graph.addChildNode(parentNodeId, type);
    const newGraph = new Graph();
    newGraph.nodes = graph.nodes;
    newGraph.nextNodeId = graph.nextNodeId
    setGraph(newGraph);
    return newChildNodeId;
  };

  // Delete node from graph. This will child nodes as well.
  const handleDeleteNode = (nodeId: number) => {

    graph.deleteNode(nodeId);
    const newGraph = new Graph();
    newGraph.nodes = graph.nodes;
    newGraph.nextNodeId = graph.nextNodeId
    setGraph(newGraph);
  };

  // Remove nodes and edges from react flow and delete node from graph.
  const handleRemoveNodeAndEdges = (id: number) => {

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
      // If node is a if block, we have to delete else block as well.
      if (node.type == "ifBlock") {
        handleRemoveNodeAndEdges(id + 2)
      }
    } else {
      console.log("Node not found!")
    }
  }

  // Add Conditional blocks (IF, FAIL, PASS)
  const addConditionalBlock = (blockType: BlockType) => {
    if (!selectedNode) {
      return
    }
    const selectedNodeId: number = +selectedNode.id
    switch (blockType) {
      case (BlockType.IF): {
        if (selectedNode.type == BlockType.THEN || selectedNode.type == BlockType.ELSE || selectedNode.type == BlockType.START) {
          const ifBlockId = handleAddChildNode(selectedNodeId, BlockType.IF);
          const ifBlock = {
            id: ifBlockId.toString(),
            type: BlockType.IF,
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y - 100 }, data: {
              remove: handleRemoveNodeAndEdges,
              attributes: attributesArray
            }
          };
          const thenBlockId: number = handleAddChildNode(ifBlockId, BlockType.THEN);
          const thenBlock = {
            id: thenBlockId.toString(),
            type: BlockType.THEN,
            position: { x: ifBlock.position.x + 300, y: ifBlock.position.y + 100 }, data: null
          };
          const elseBlockId: number = handleAddChildNode(ifBlockId, BlockType.ELSE);
          const elseBlock = {
            id: elseBlockId.toString(),
            type: BlockType.ELSE,
            position: { x: ifBlock.position.x + 200, y: ifBlock.position.y + 350 }, data: null
          };
          addNode(ifBlock);
          addNode(thenBlock);
          addNode(elseBlock);
          addEdge({ id: 'e' + selectedNodeId.toString() + '-' + ifBlockId.toString(), source: selectedNodeId.toString(), target: ifBlockId.toString() })
          addEdge({ id: 'e' + ifBlockId.toString() + '-' + elseBlockId.toString(), source: ifBlockId.toString(), target: elseBlockId.toString(), sourceHandle: 'else' })
          addEdge({ id: 'e' + ifBlockId.toString() + '-' + thenBlockId.toString(), source: ifBlockId.toString(), target: thenBlockId.toString(), sourceHandle: 'then', })
        }
        break
      }

      case (BlockType.FAIL): {
        if (selectedNode.type == BlockType.THEN || selectedNode.type == BlockType.ELSE) {
          const failBlockId: number = handleAddChildNode(selectedNodeId, BlockType.FAIL);
          const failBlock = {
            id: failBlockId.toString(),
            type: BlockType.FAIL,
            position: { x: selectedNode.position.x + 150, y: selectedNode.position.y }, data: null
          };
          addNode(failBlock);
          addEdge({ id: 'e' + selectedNodeId.toString() + '-' + failBlockId.toString(), source: selectedNodeId.toString(), target: failBlockId.toString() })
          addEdge({ id: 'e' + failBlockId.toString() + '-' + '2', source: failBlockId.toString(), target: '2' })
        }
        break
      }

      case (BlockType.PASS): {
        if (selectedNode.type == BlockType.THEN || selectedNode.type == BlockType.ELSE) {
          const passBlockId: number = handleAddChildNode(selectedNodeId, BlockType.PASS);
          const passBlock = {
            id: passBlockId.toString(),
            type: BlockType.PASS,
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

  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  function handleEditorChange(value: any, event: any) {
    setInputEditorValue(value);
  }

  function handleEditorValidation(markers: any) {

    if (markers.length === 0) {
      setInputValidated(true);
    } else {
      setInputValidated(false);
    }
  }

  function handleInputSubmit() {
    console.log(inputValidated)
  }

  const [showController, setShowController] = useState(false);


  const toggleController = () => {
    setShowController((prevShowController) => !prevShowController);
  };

  const [selectedControllerTab, setSelectedControllerTab] = useState<ControllerType>(ControllerType.VALIDATORS);

  return (
    <div>

      <div className="h-screen w-screen flex justify-center items-center">
        <ReactFlow className="bg-gray-200" nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} defaultEdgeOptions={edgeOptions} onNodeClick={(event, node) => {
          if (node?.id) {
            setSelectedNode(node)
          }
        }}>
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <button
        className="absolute flex justify-center items-center w-9 h-9 top-8 right-8 bg-gray-50 z-10 border-2 border-gray-400 px-4 py-2 rounded"
        onClick={toggleController}
      >
        {showController ? <CloseIcon className="text-gray-600" /> : <TableChartOutlinedIcon className="text-gray-600" />}
      </button>

      {/* Controller View */}
      {showController && (
        <div className="absolute pt-10 top-6 right-6 w-1/4 bg-white shadow-lg rounded-md">
          <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px">
              <li className="mr-2">
                <a href="#" className={`inline-block p-4 border-b-2 ${selectedControllerTab === ControllerType.VALIDATORS ? "text-blue-600 border-blue-600" : "border-transparent hover:text-gray-600 hover:border-gray-300"}`} onClick={() => {setSelectedControllerTab(ControllerType.VALIDATORS)}}>Validators</a>
              </li>
              <li className="mr-2">
                <a href="#" className={`inline-block p-4 border-b-2 ${selectedControllerTab === ControllerType.INPUT ? "text-blue-600 border-blue-600" : "border-transparent hover:text-gray-600 hover:border-gray-300"}`} onClick={() => {setSelectedControllerTab(ControllerType.INPUT)}}>Input</a>
              </li>
            </ul>
          </div>
          {selectedControllerTab === ControllerType.VALIDATORS ? (
          <div className="pb-2 rounded-lg bg-white">
          <ActionBar addConditionalBlock={addConditionalBlock} />
        </div>
          ) : selectedControllerTab === ControllerType.INPUT ? (
            <div className="rounded-lg bg-white">
            <Editor
              height="50vh"
              defaultLanguage="json"
              defaultValue={initialInput}
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
              onValidate={handleEditorValidation}
              loading={true}
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleInputSubmit}
            >
              Submit
            </button>
          </div>
          ) : (
            null
          )}
        </div>

      )}
    </div>
  )
}

export default App

