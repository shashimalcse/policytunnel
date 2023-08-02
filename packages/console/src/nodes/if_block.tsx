import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

type IfBlockData = {
    data: any;
  };

function IfBlock({ data }: NodeProps<IfBlockData>) {

  const [isOpen, setIsOpen] = useState(false);
  const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={true}
      />
      <div className='flex flex-col justify-center items-center w-48 h-48 bg-white font-sans'>
        <div className=''>If</div>
        <div className='grow'>
        <button
        onClick={toggleDropdown}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Select an Option
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded w-48">
          {options.map((option, index) => (
            <div
              key={index}
              className="py-2 px-4 cursor-pointer hover:bg-blue-100"
              onClick={() => {
                console.log('Selected:', option);
                toggleDropdown();
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
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
