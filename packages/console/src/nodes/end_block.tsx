import { Handle, Position } from 'reactflow';


function EndBlock() {
  return (
    <>
      <div className='flex justify-center items-center w-16 h-16 rounded-full border-4 border-white shadow-md bg-black font-sans text-white text-xs'>
        <div className=''>End</div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        className=''
        isConnectable={true}
      />
    </>
  );
}

export default EndBlock;
