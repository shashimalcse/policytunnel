import ReactFlow, {
  Background, MiniMap,
  Controls, BackgroundVariant
} from 'reactflow';
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
import { AttributeInfo, ExtractAttributesFromInput } from "@policytunnel/core/src/input_processor/input_loader";
import { findPaths } from "@policytunnel/core/src/graph_processor/path_finder";
import Editor from '@monaco-editor/react'
import CloseIcon from '@mui/icons-material/Close';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import CodeMirror from '@uiw/react-codemirror';
import Graph, { NodeProperties } from '@policytunnel/core/src/graph_processor/graph';
import { BlockType } from "@policytunnel/core/src/graph_processor/constants/block_types";
import { ControllerType } from './constants/controller';
import useNodeStore from './store';
import { executePaths } from '@policytunnel/core/src/graph_processor/path_executor';
import { getOpaPolicy } from '@policytunnel/core/src/opa_generator/generator';
import initialInputValue from '@policytunnel/core/src/initialInput.json';


const nodeTypes = {
    ifBlock: IfBlock,
    elseBlock: ElseBlock,
    startBlock: StartBlock,
    endBlock: EndBlock,
    thenBlock: ThenBlock,
    passBlock: PassBlock,
    failBlock: FailBlock
  };

const selector = (state: { nodes: any; edges: any; onNodesChange: any; onEdgesChange: any; onConnect: any; addNode: any; addEdge: any; removeNode: any; updateIfNodesAttributes: any }) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
  addEdge: state.addEdge,
  removeNode: state.removeNode,
  updateIfNodesAttributes: state.updateIfNodesAttributes
});

const edgeOptions = {
  animated: true,
  style: {
    stroke: 'black',
  },
};

function App() {

  const initialInput: string = JSON.stringify(initialInputValue);

  const { nodes, edges, onNodesChange, onEdgesChange, addNode, addEdge, removeNode, updateIfNodesAttributes } = useNodeStore(selector);
  const [selectedNode, setSelectedNode] = useState<any>();
  const [inputEditorValue, setInputEditorValue] = useState<string>(initialInput);
  const [inputValidated, setInputValidated] = useState<boolean>(true);
  const [playgroundInputEditorValue, setPlaygroundInputEditorValue] = useState<string>(initialInput);
  const [playgroundInputValidated, setPlaygroundInputValidated] = useState<boolean>(true);
  const [playgroundOutput, setPlaygroundOutput] = useState<string>("");
  const [conditionalAttributes, setConditionalAttributes] = useState<AttributeInfo[]>(ExtractAttributesFromInput(initialInput));

  // This is the grpah we use to keep the nodes and later we will pass this for policy generation.
  const [graph, setGraph] = useState<Graph>(new Graph());

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
  const handleDeleteNode = (nodeId: number): void => {

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

      for (const nodeId of nodesToDelete) {
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
              attributes: conditionalAttributes,
              updateNodeProperties: updateNodeProperties
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
  const playgroundEditorRef = useRef(null);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
  }

  function handlePlaygroundEditorDidMount(editor: any, monaco: any) {
    playgroundEditorRef.current = editor;
  }

  function handleEditorChange(value: any, event: any) {
    setInputEditorValue(value);
  }

function handlePlaygroundEditorChange(value: any, event: any) {
    setPlaygroundInputEditorValue(value);
  }

  function handleEditorValidation(markers: any) {

    if (markers.length === 0) {
      setInputValidated(true);
    } else {
      setInputValidated(false);
    }
  }

  function handlePlaygroundEditorValidation(markers: any) {

    if (markers.length === 0) {
      setPlaygroundInputValidated(true);
    } else {
      setPlaygroundInputValidated(false);
    }
  }

  function handleInputSubmit() {
    if (inputValidated) {
      setConditionalAttributes(ExtractAttributesFromInput(inputEditorValue))
      updateIfNodesAttributes(ExtractAttributesFromInput(inputEditorValue))
    }
  }

  function handlePlaygroundInputSubmit() {
    if (playgroundInputValidated) {
      const path: any = findPaths(graph, 1, 'passBlock')
      const allowed: boolean = executePaths(playgroundInputEditorValue, graph, path);
      if (allowed) {
        setPlaygroundOutput("allowed")
      } else {
        setPlaygroundOutput("not allowed")
      }
    }
  }



  const [showController, setShowController] = useState(false);
  const [opaPolicyValue, setOpaPolicyValue] = useState("");

  const toggleController = () => {
    setShowController((prevShowController) => !prevShowController);
  };

  const updateNodeProperties = (id: number, properties: NodeProperties) => {

    graph.updateNodeProperties(id, properties);
    const newGraph = new Graph();
    newGraph.nodes = graph.nodes;
    newGraph.nextNodeId = graph.nextNodeId
    setGraph(newGraph);
    console.log(graph)
  }

  const handleGenerator = () => {
    const path: any = findPaths(graph, 1, 'passBlock')
    const opa_condition = getOpaPolicy(graph, path)
    setOpaPolicyValue(opa_condition)
  }

  const [selectedControllerTab, setSelectedControllerTab] = useState<ControllerType>(ControllerType.VALIDATORS);

  return (
    <div>

      <div className="h-screen w-screen flex justify-center items-center">
        <ReactFlow className="bg-gray-200" nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} defaultEdgeOptions={edgeOptions} onNodeClick={(event, node) => {
          if (node?.id) {
            setSelectedNode(node)
            setShowController(true)
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
              <li className="flex-1">
                <a href="#" className={`inline-block p-4 border-b-2 ${selectedControllerTab === ControllerType.VALIDATORS ? "text-blue-600 border-blue-600" : "border-transparent hover:text-gray-600 hover:border-gray-300"}`} onClick={() => { setSelectedControllerTab(ControllerType.VALIDATORS) }}>Validators</a>
              </li>
              <li className="flex-1">
                <a href="#" className={`inline-block p-4 border-b-2 ${selectedControllerTab === ControllerType.INPUT ? "text-blue-600 border-blue-600" : "border-transparent hover:text-gray-600 hover:border-gray-300"}`} onClick={() => { setSelectedControllerTab(ControllerType.INPUT) }}>Input</a>
              </li>
              <li className="flex-1">
                <a href="#" className={`inline-block p-4 border-b-2 ${selectedControllerTab === ControllerType.GENERATOR ? "text-blue-600 border-blue-600" : "border-transparent hover:text-gray-600 hover:border-gray-300"}`} onClick={() => { setSelectedControllerTab(ControllerType.GENERATOR) }}>Generator</a>
              </li>
              <li className="flex-1">
                <a href="#" className={`inline-block p-4 border-b-2 ${selectedControllerTab === ControllerType.PLAYGROUND ? "text-blue-600 border-blue-600" : "border-transparent hover:text-gray-600 hover:border-gray-300"}`} onClick={() => { setSelectedControllerTab(ControllerType.PLAYGROUND) }}>Playground</a>
              </li>
            </ul>
          </div>
          {selectedControllerTab === ControllerType.VALIDATORS ? (
            <div className="pb-2 rounded-lg bg-white">
              <ActionBar addConditionalBlock={addConditionalBlock} />
            </div>
          ) : selectedControllerTab === ControllerType.INPUT ? (
            <div className="flex flex-col justify-center items-center pt-2 rounded-lg bg-white">
              <Editor
                height="50vh"
                defaultLanguage="json"
                defaultValue={inputEditorValue}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                onValidate={handleEditorValidation}
                loading={true}
              />
              <button
                className="my-5 px-4 py-2 bg-gray-900 text-white rounded-full text-xs"
                onClick={handleInputSubmit}
              >
                Submit
              </button>
            </div>
          ) : selectedControllerTab === ControllerType.GENERATOR ? (
            <div className="flex flex-col justify-center items-center pt-2 rounded-lg bg-white">
              <CodeMirror
                value={opaPolicyValue}
                height="50vh"
                width='300px'
                onChange={() => null}
              />
              <button
                className="my-5 px-4 py-2 bg-gray-900 text-white rounded-full text-xs"
                onClick={handleGenerator}
              >
                Generate
              </button>
            </div>
          ) : selectedControllerTab === ControllerType.PLAYGROUND ? (
            <div className="flex flex-col pt-2 rounded-lg bg-white">
              <div className="flex flex-col ml-2 py-2 justify-start text-xs font-medium">
                Example Input:
              </div>
              <div>
              </div>
              <Editor
                height="50vh"
                defaultLanguage="json"
                defaultValue={inputEditorValue}
                onMount={handlePlaygroundEditorDidMount}
                onChange={handlePlaygroundEditorChange}
                onValidate={handlePlaygroundEditorValidation}
                loading={true}
              />
              <div className={`flex m-2 py-2 justify-center items-center text-xs text-white rounded ${playgroundOutput === "allowed" ? "bg-green-500 " : playgroundOutput === "not allowed" ? "bg-red-500" : ""}`}>
                {playgroundOutput}
              </div>
              <div className="flex flex-col ml-2 py-2 justify-center items-center">
                <button
                  className="w-20 px-4 py-2 bg-gray-900 text-white rounded-full text-xs"
                  onClick={handlePlaygroundInputSubmit}
                >
                  Evaluate
                </button>
              </div>

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

