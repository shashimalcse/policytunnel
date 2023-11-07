import { JSON } from "json-as/assembly";

// @json or @serializable work here
@json
class Attribute {
  name!: string;
  type!: string;
}

@json
class Property {
  attribute!: Attribute;
  operator!: string;
  value!: Array<string>;
}

type Paths = Array<Array<Property>>;



export function validateTunnelPolicy(jsonString: string) : bool {
  const paths = JSON.parse<Paths>(jsonString);
  for (let p = 0; p < paths.length; p++) {
    let path = paths[p];
    for (let i = 0; i < path.length; i++) {
      let property = path[i];
      let operator = property.operator;
      let attributeName = property.attribute.name;
      if (attributeName == "authn_ctx.sub") {
        return true
      }
    }
  }
  return false
}
