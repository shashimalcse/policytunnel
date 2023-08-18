import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

type IfBlockData = {
  remove: (id:number) => void
};

const IfBlock = ({id, data}: NodeProps<IfBlockData>) => {

  const [actionSelected, setActionSelected] = useState<boolean>(false);
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={true}
      />
      <div className='flex flex-col items-center'>
        {actionSelected ? <div className="h-10 w-full mb-2 bg-gray-600 rounded-md shadow-md p-3 flex flex-row items-center justify-end text-xs">
          <div className="relative w-8 flex justify-center items-center rounded" onClick={() => data.remove(+id)}>
            <div className="absolute w-full h-full bg-gray-400 rounded-sm opacity-0 hover:opacity-20"></div>
            <DeleteOutlineIcon className="text-white" />
          </div>
          <div className="relative w-8 flex justify-center items-center rounded" onClick={() => { setActionSelected(false) }}>
            <div className="absolute w-full h-full bg-gray-400 rounded-sm opacity-0 hover:opacity-20"></div>
            <CloseIcon className="text-white" />
          </div>
        </div> : null}
        <div className="w-56 bg-white rounded-md border-2 border-gray-300 shadow-md p-3 flex flex-col items-center text-xs">
          <div className="mb-3 w-full text-center" onClick={() => { setActionSelected(true) }}>
            If block
          </div>

          <div className="mb-3 w-full">
            <label htmlFor="dropdown1" className="text-gray-600 mb-1 block">
              Attribute:
            </label>
            <select
              id="dropdown1"
              className="border border-gray-300 rounded w-full px-3 py-2"
            >
              <option value="option1">username</option>
              <option value="option2">gender</option>
              <option value="option3">lastname</option>
            </select>
          </div>

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
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ background: '#555' }}
        isConnectable={true}
      />
    </>
  );
}

export default IfBlock;
