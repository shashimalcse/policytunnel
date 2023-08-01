import { Handle, Position } from 'reactflow';


function StartBlock() {
  return (
    <>
      <div className='flex justify-center items-center w-16 h-16 rounded-full bg-white font-sans'>
        <div className=''>Start</div>
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

export default StartBlock;
