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
import { BlockType } from './constants/block_types';
import { AttributeInfo } from '@policytunnel/shared/src/input_processor/input_loader';

const initialNodes: Node[] = [
    { id: '1', type: BlockType.START, position: { x: 100, y: 150 }, data: null },
    { id: '2', type: BlockType. END, position: { x: 950, y: 150 }, data: null },
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
    updateIfNodesAttributes: (attributes : AttributeInfo[]) => void;

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
    updateIfNodesAttributes: (attributes : AttributeInfo[]) => {
            set({
              nodes: get().nodes.map((node) => {
                if (node.type === BlockType.IF) {
                  // it's important to create a new object here, to inform React Flow about the cahnges
                  node.data = { ...node.data, attributes };
                }
        
                return node;
              }),
            });
    },
}));

export default useStore;
