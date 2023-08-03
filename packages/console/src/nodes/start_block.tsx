import { Handle, Position } from 'reactflow';


function StartBlock() {
  return (
    <>
      <div className='flex justify-center items-center w-16 h-16 rounded-full border-4 border-white shadow-md bg-black font-sans text-white text-xs'>
        Start
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        isConnectable={true}
      />
    </>
  );
}

export default StartBlock;
