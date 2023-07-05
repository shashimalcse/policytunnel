export interface Input {
   validators: Validator[] | null
}

export interface Validator {
   name: string;
   conf: Conf;
}
export interface Conf {
   fields?: (FieldsEntity)[] | null;
   if?: (ConditionalEntity)[] | null;
   then?: (ConditionalEntity) | null;
   else?: (ConditionalEntity) | null;
}
export interface FieldsEntity {
   field: string;
   comparator: string;
   value: string;
}

export interface ConditionalEntity {
   name: string;
   conf: Conf;
}

export const getRegoPolicy = (): String => {
   const jsonString = `{
      "validators":[
         {
            "name":"conditional",
            "conf":{
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
               "then": {
                     "conf":{
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
                        "then":{
                              "conf":{
                                 
                              },
                              "name":"false"
                        },
                        "else":{
                              "conf":{
                                 
                              },
                              "name":"true"
                        }
                     },
                     "name":"conditional"
               },
               "else":{
                     "conf":{
                        
                     },
                     "name":"true"
               }
            }
         }
      ]
   }`;

   const input: Input = JSON.parse(jsonString)
   const falseThenPaths = findAllowedPaths(input);
   console.log(falseThenPaths)
   falseThenPaths.forEach(function (value) {
      const conditions  = traverseAllowedPath(input, value)
      console.log(conditions)
      console.log("==========")
   })
   var regoPolicy = ""
   return regoPolicy
}

function findAllowedPaths(input: Input): string[] {
   const allowedPaths: string[] = [];

   // Recursive function to traverse the object
   function traverseObject(obj: any, path: string) {
      if (Array.isArray(obj)) {
         for (let i = 0; i < obj.length; i++) {
            traverseObject(obj[i], `${path}[${i}]`);
         }
      } else if (typeof obj === 'object' && obj !== null) {
         if (obj.name === 'true') {
            allowedPaths.push(path);
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

   return allowedPaths;
}

function traverseAllowedPath(input: Input, path: string): any[] {
   const ifConditions: any = { negative: [], positive: [] }
   const keys = path.split('.').map(key => key.replace(/\[(\d+)\]/, '.$1').replace(/^\./, '').split('.'));
   let result: any = input;
   keys.forEach(keyArr => {
      keyArr.forEach(key => {
         if (typeof result !== 'undefined' && result !== null && key in result) {
            if (result.name == "conditional") {
               if (result.conf.else.name == "true") {
                  ifConditions.negative.push(result.conf.if)
               } else {
                  ifConditions.positive.push(result.conf.if)
               }
               
            }
            result = result[key];
       } else {
            result = undefined;
         }
      });
   });
   return ifConditions;
}

