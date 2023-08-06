interface ActionBarProps {
    addConditionalBlock: (nodeId: number) => void;
}

export enum BlockType {
    CONDITIONAL,
    FAIL,
    PASS
}
  
const ActionBar : React.FC<ActionBarProps> = ({ addConditionalBlock }) => {
    return (
        <>
            <div className='flex flex-col'>
            <div className='mt-2 text-center font-sans text-lg font-semibold'>
                    <div className=''>Nodes</div>
                </div>
                <button className='p-4 mx-5 mt-2 text-center items-center rounded-md border border-gray-300 drop-shadow-sm bg-white font-sans text-xs' onClick={() => addConditionalBlock(BlockType.CONDITIONAL)}>
                    <div className=''>Conditional</div>
                </button>
                <button className='p-4 mx-5 mt-2 text-center items-center rounded-md border border-gray-300 drop-shadow-sm bg-white font-sans text-xs' onClick={() => addConditionalBlock(BlockType.PASS)}>
                    <div className=''>Pass</div>
                </button>
                <button className='p-4 mx-5 mt-2 text-center items-center rounded-md border border-gray-300 drop-shadow-sm bg-white font-sans text-xs' onClick={() => addConditionalBlock(BlockType.FAIL)}>
                    <div className=''>Fail</div>
                </button>
            </div>
        </>
    );
}

export default ActionBar;
