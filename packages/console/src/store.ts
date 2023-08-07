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
    { id: '0', type: 'startBlock', position: { x: 100, y: 150 }, data: null },
    { id: '10000', type: 'endBlock', position: { x: 950, y: 150 }, data: null },
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
    removeNode: (id: string) => void;

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
        set({
            edges: [...get().edges, edge],
        });
    },
    removeNode: (id: string) =>
        set((state) => ({
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
        })),
}));

export default useStore;
