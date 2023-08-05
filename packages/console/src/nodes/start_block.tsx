import { Handle, Position, NodeProps } from 'reactflow';
import AddIcon from '@mui/icons-material/Add';

const StartBlock = () => {

  return (
    <>
      <div className='flex justify-center items-center w-16 h-16 rounded-full border-4 border-white shadow-md bg-black font-sans text-white text-xs'>
        Start
      </div>
      <div className='absolute flex justify-center items-center bg-black rounded-full' style={{ top: '50%', right: '-15px', transform: 'translateY(-50%)' }}>
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          isConnectable={true}
          className='z-40 p-[8px] bg-transparent border-transparent'
        />
        <div className='flex items-center justify-center w-4 h-4'>
          <AddIcon style={{fontSize: '10px', color: 'white'}}/>    
        </div>
      </div>

    </>
  );
}

export default StartBlock;
