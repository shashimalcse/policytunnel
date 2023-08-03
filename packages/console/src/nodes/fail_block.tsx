import { Handle, Position } from 'reactflow';


function FailBlock() {
  return (
    <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={true}
            />
<div className='flex justify-center items-center w-16 h-10 rounded-md border-2 border-gray-300 shadow-md bg-white font-sans text-xs'>
                <div className='text-rose-600'>Fail</div>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                id="a"
                className=''
                isConnectable={true}
            />
    </>
  );
}

export default FailBlock;
