import { Handle, Position } from 'reactflow';


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
            <div className='flex justify-center items-center w-16 h-10 rounded-lg bg-white font-sans'>
                <div className=''>Then</div>
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

export default ThenBlock;
