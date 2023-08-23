import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { AttributeInfo } from '@policytunnel/core/src/input_processor/input_loader';
import { NodeProperties } from '@policytunnel/core/src/graph_processor/graph';

type IfBlockData = {
  remove: (id:number) => void
  attributes : AttributeInfo[]
  updateNodeProperties: (id: number, properties: NodeProperties) => void
};

interface OperatorOption {
  value: string;
  label: string;
}

const IfBlock = ({id, data}: NodeProps<IfBlockData>) => {

  const operatorOptions: OperatorOption[] = [
    { value: 'equal', label: 'Equal' },
    { value: 'notEqual', label: 'Not Equal' },
    { value: 'contains', label: 'Contains' }
  ];

  const getOperatorOptions = (attribute: AttributeInfo): OperatorOption[] => {
    switch (attribute.type) {
      case 'string':
      case 'number':
      case 'boolean':
        return operatorOptions.slice(0, 2); // 'equal' and 'not equal'
      case 'array':
        return operatorOptions.slice(2, 3); // 'contains'
      default:
        return [];
    }
  };

  const [actionSelected, setActionSelected] = useState<boolean>(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeInfo>(data.attributes[0]);
  const [selectedOperators, setSelectedOperators] = useState<OperatorOption[]>(getOperatorOptions(data.attributes[0]));
  const [selectedOperator, setSelectedOperator] = useState<string>(selectedOperators[0].value);
  const [value, setValue] = useState<string|string[]>();

  const handleAttributeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const attribute = data.attributes.find(attribute => attribute.name === event.target.value)
    if (attribute) {
      setSelectedAttribute(attribute);
      setSelectedOperators(getOperatorOptions(attribute))
      setSelectedOperator(getOperatorOptions(attribute)[0].value);
      data.updateNodeProperties(+id, {attribute: attribute, operator: getOperatorOptions(attribute)[0].value, value: value})
    }
  };
  const handleOperatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperator(event.target.value);
    data.updateNodeProperties(+id, {attribute: selectedAttribute, operator: event.target.value, value: value})
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    data.updateNodeProperties(+id, {attribute: selectedAttribute, operator: selectedOperator, value: event.target.value})
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
              value={selectedAttribute.name}
              onChange={handleAttributeChange}
            >
            {data.attributes.map(attr => (
              <option key={attr.name} value={attr.name}>
                {attr.name}
              </option>
            ))}
            </select>
          </div>

          <div className="mb-3 w-full">
            <label htmlFor="dropdown2" className="text-gray-600 mb-1 block">
              Opeartor:
            </label>
            <select
              id="dropdown2"
              className="border border-gray-300 rounded w-full px-3 py-2"
              value={selectedOperator}
              onChange={handleOperatorChange}
            >
            {selectedOperators.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
              placeholder="Value"
              onChange={handleValueChange}
            />
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="then"
        style={{ background: '#555' }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="else"
        style={{ background: '#555' }}
        isConnectable={true}
      />
    </>
  );
}

export default IfBlock;
