import { Handle, Position } from 'reactflow';
import AddIcon from '@mui/icons-material/Add';

function ThenBlock() {
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
                <div className=''>Then</div>
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
                    <AddIcon style={{ fontSize: '10px', color: 'white' }} />
                </div>
            </div>
        </>
    );
}

export default ThenBlock;
