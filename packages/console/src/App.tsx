import ReactFlow , { Background, MiniMap,
  Controls, BackgroundVariant } from 'reactflow';
import { getRegoPolicy } from "@policytunnel/core/src/opa/convertor";
import './App.css'
import 'reactflow/dist/style.css';

function App() {

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
getRegoPolicy()
  return (
    <div style={{ width: '100vw', height: '100vh'}}>
      <ReactFlow nodes={initialNodes} edges={initialEdges}>
        <Background color="#FFFFFF" variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default App
