export interface Validator {
    name: string;
    conf: Conf;
  }
  export interface Conf {
    fields?: (FieldsEntity)[] | null;
    branches?: (BranchesEntity)[] | null;
  }
  export interface FieldsEntity {
    field: string;
    comparator: string;
    value: string;
  }
  export interface BranchesEntity {
    if?: (IfEntity)[] | null;
    then?: (ThenEntity)[] | null;
  }
  export interface IfEntity {
    name: string;
    conf: Conf;
  }
  export interface ThenEntity {
    name: string;
    conf: Conf | null;
  }
  export interface Conf2 {
  }
  


export const getRegoPolicy = (validators : Validator[]) : String => {
    var regoPolicy = ""
    return regoPolicy
}
