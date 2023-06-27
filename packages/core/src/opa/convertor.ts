export interface Input {
   validators: Validator[] | null
}

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



export const getRegoPolicy = (): String => {
   const jsonString = `{
        "validators": [
         {
            "name":"conditional",
            "conf":{
               "branches":[
                  {
                     "if":[
                        {
                           "conf":{
                              "fields":[
                                 {
                                    "comparator":"contains",
                                    "field":"authnCtx.scp",
                                    "value":[
                                       "email",
                                       "profile"
                                    ]
                                 }
                              ]
                           },
                           "name":"attributes"
                        }
                     ],
                     "then":[
                        {
                           "conf":{
                              "branches":[
                                 {
                                    "if":[
                                       {
                                          "conf":{
                                             "fields":[
                                                {
                                                   "comparator":"equals",
                                                   "field":"authnCtx.gender",
                                                   "value":"female"
                                                }
                                             ]
                                          },
                                          "name":"authn-context"
                                       }
                                    ],
                                    "then":[
                                       {
                                          "conf":{
                                             
                                          },
                                          "name":"false"
                                       }
                                    ]
                                 },
                                 {
                                    "if":[
                                       {
                                          "conf":{
                                             
                                          },
                                          "name":"true"
                                       }
                                    ],
                                    "then":[
                                       {
                                          "conf":{
                                             
                                          },
                                          "name":"true"
                                       }
                                    ]
                                 }
                              ]
                           },
                           "name":"conditional"
                        }
                     ]
                  },
                  {
                     "if":[
                        {
                           "conf":{
                              
                           },
                           "name":"true"
                        }
                     ],
                     "then":[
                        {
                           "conf":{
                              
                           },
                           "name":"false"
                        }
                     ]
                  }
               ]
            },
            "recovery":null
         }
      ]
     }`;

   const input: Input = JSON.parse(jsonString)
   console.log(input)
   const falseThenPaths = findFalseThenEntities(input);
   falseThenPaths.forEach(function (value) {
      traversePath(input, value)
   })
   console.log(falseThenPaths)
   var regoPolicy = ""
   return regoPolicy
}

function findFalseThenEntities(input: Input): string[] {
   const falseThenPaths: string[] = [];

   // Recursive function to traverse the object
   function traverseObject(obj: any, path: string) {
      if (Array.isArray(obj)) {
         for (let i = 0; i < obj.length; i++) {
            traverseObject(obj[i], `${path}[${i}]`);
         }
      } else if (typeof obj === 'object' && obj !== null) {
         if (obj.name === 'false') {
            falseThenPaths.push(path);
         }
         for (const key in obj) {
            traverseObject(obj[key], `${path}.${key}`);
         }
      }
   }

   if (input.validators !== null) {
      for (let i = 0; i < input.validators.length; i++) {
         traverseObject(input.validators[i], `validators[${i}]`);
      }
   }

   return falseThenPaths;
}

function traversePath(input: Input, path: string): any {
   const keys = path.split('.').map(key => key.replace(/\[(\d+)\]/, '.$1').replace(/^\./, '').split('.'));
   let result: any = input;
   keys.forEach(keyArr => {
      keyArr.forEach(key => {
         if (typeof result !== 'undefined' && result !== null && key in result) {
            result = result[key];
            if (result.if) {
               console.log(result)
            }
       } else {
            result = undefined;
         }
      });
   });
   return result;
}
