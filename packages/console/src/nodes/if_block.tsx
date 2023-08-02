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
    <div className="w-80 bg-white rounded-md shadow-md p-3 flex flex-col items-center text-xs">
      {/* Name */}
      <div className="mb-3 w-full text-center text-base">
        If block
      </div>

      {/* Dropdown 1 */}
      <div className="mb-3 w-full">
        <label htmlFor="dropdown1" className="text-gray-600 mb-1 block">
          Attribute:
        </label>
        <select
          id="dropdown1"
          className="border border-gray-300 rounded w-full px-3 py-2"
        >
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      </div>

      {/* Dropdown 2 */}
      <div className="mb-3 w-full">
        <label htmlFor="dropdown2" className="text-gray-600 mb-1 block">
          Opeartor:
        </label>
        <select
          id="dropdown2"
          className="border border-gray-300 rounded w-full px-3 py-2"
        >
          <option value="equal">Equal</option>
          <option value="not_equal">Not Equal</option>
        </select>
      </div>

      {/* Text Input */}
      <div className="mb-3 w-full">
        <label htmlFor="textInput" className="text-gray-600 mb-1 block">
          Value:
        </label>
        <input
          type="text"
          id="textInput"
          className="border border-gray-300 rounded w-full px-3 py-2"
          placeholder="Enter some text"
        />
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
