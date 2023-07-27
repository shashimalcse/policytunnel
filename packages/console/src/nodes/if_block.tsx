import { Handle, NodeProps, Position } from 'reactflow';

type IfBlockData = {
    data: any;
  };

function IfBlock({ data }: NodeProps<IfBlockData>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={true}
      />
      <div>
        If block
      </div>
      <input className="nodrag" type="color"/>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
        isConnectable={true}
      />
    </>
  );
}

export default IfBlock;
