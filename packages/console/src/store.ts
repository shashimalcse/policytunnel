import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

const initialNodes: Node[] = [
    { id: '1', type: 'startBlock', position: { x: 100, y: 150 }, data: null },
    { id: '2', type: 'endBlock', position: { x: 950, y: 150 }, data: null },
    // {
    //   id: '3',
    //   type: 'ifBlock',
    //   position: { x: 250, y: 50 }, data: null
    // },
    // {
    //   id: '4',
    //   type: 'elseBlock',
    //   position: { x: 350, y: 400 }, data: null
    // },
    // {
    //   id: '5',
    //   type: 'thenBlock',
    //   position: { x: 650, y: 150 }, data: null
    // },
    // {
    //   id: '6',
    //   type: 'passBlock',
    //   position: { x: 750, y: 150 }, data: null
    // },
    // {
    //   id: '7',
    //   type: 'failBlock',
    //   position: { x: 450, y: 400 }, data: null
    // },
  ];
  const initialEdges: Edge[] = [];

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode(node: Node) {
    set({
      nodes: [...get().nodes, node],
    });
  },
  addEdge(edge: Edge) {
    console.log('llll');
    set({
      edges: [...get().edges, edge],
    });
  },
}));

export default useStore;
