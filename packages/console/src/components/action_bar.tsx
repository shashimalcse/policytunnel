import { BlockType } from "@policytunnel/core/src/graph_processor/constants/block_types";

interface ActionBarProps {
    addConditionalBlock: (blockType: BlockType) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ addConditionalBlock }) => {
    return (
        <>
            <div className='flex flex-col'>
                <button className='p-4 mx-5 mt-2 text-center items-center rounded-md border border-gray-300 drop-shadow-sm bg-white font-sans text-xs' onClick={() => addConditionalBlock(BlockType.IF)}>
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
