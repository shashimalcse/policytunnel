export interface AttributeInfo {
    name: string;
    type: string;
  }
  
export const ExtractAttributesFromInput = (jsonString: string): AttributeInfo[] => {
    const data = JSON.parse(jsonString);
    const resultArray: AttributeInfo[] = [];
  
    function processObject(obj: any, path: string = ''): void {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const fullPath = path ? `${path}.${key}` : key;
          const value = obj[key];
  
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            resultArray.push({name: fullPath, type: typeof value});
          } else if (Array.isArray(value)) {
            resultArray.push({name: fullPath, type: 'array'});
          } else if (typeof value === 'object') {
            processObject(value, fullPath);
          }
        }
      }
    }
    processObject(data);
    return resultArray;
}
