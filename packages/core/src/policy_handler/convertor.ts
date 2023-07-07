import { readFileSync, writeFileSync } from 'fs';

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

export enum PathType {
   Allow,
   Deny
}

export const getRegoPolicy = (jsonString: string, pathType:PathType): any => {

   const input: Input = JSON.parse(jsonString)
   const paths = findPaths(input, pathType);
   const conditions: any[] = [];
   const policies = [
      "package example",
      "import future.keywords.if",
      "default allow := false"
   ]
   paths.forEach(function (value) {
      const pathConditions: any = traversePath(input, value, pathType);
      console.log("positive")
      pathConditions.positive.forEach( function(value: ConditionalEntity[]) {
         const opaPositiveConditions: string[] = [
            "allow {"
         ]
         value.forEach(function (ifCon) {
            const opaCondition = getOpaCondition(ifCon)
            policies.push(opaCondition)
            opaPositiveConditions.push(ifCon.name + "_" + ifCon.conf.fields![0].comparator)
         })
         opaPositiveConditions.push("}")
         const policyPositiveContent = opaPositiveConditions.join('\n');
         policies.push(policyPositiveContent)

      })
      console.log("negative")
      pathConditions.negative.forEach( function(value: ConditionalEntity[]) {
         const opaNegativeConditions: string[] = [
            "allow {"
         ]
         value.forEach(function (ifCon) {
            const opaCondition = getOpaCondition(ifCon)
            policies.push(opaCondition)
            opaNegativeConditions.push("not " + ifCon.name + "_" + ifCon.conf.fields![0].comparator)
         })
         opaNegativeConditions.push("}")
         const policyNegativeContent = opaNegativeConditions.join('\n');
         policies.push(policyNegativeContent)
      })
      conditions.push(pathConditions)
   })
   const policiesContent = policies.join('\n');
   console.log(policiesContent)
   return policiesContent
}

function getOpaCondition(condition: ConditionalEntity): string {
   
   let opaCondition: string = "";
   if (condition.conf.fields) {
      switch (condition.conf.fields[0].comparator) {
         case "contains": {
            console.log("contains")
            break;
         }
         case "equals": {
            opaCondition = condition.name + "_" + condition.conf.fields[0].comparator + " if input." + condition.conf.fields[0].field + " == \"" + condition.conf.fields[0].value + "\"";
            break;
         }
      }
   }
   return opaCondition
}

function findPaths(input: Input, pathType: PathType): string[] {
   const allowedPaths: string[] = [];
   let checkType: string;
   switch (pathType) {
      case PathType.Allow : {
         checkType = 'true';
         break;
      }
      case PathType.Deny : {
         checkType = 'false';
         break;
      }
   } 
   // Recursive function to traverse the object
   function traverseObject(obj: any, path: string) {
      if (Array.isArray(obj)) {
         for (let i = 0; i < obj.length; i++) {
            traverseObject(obj[i], `${path}[${i}]`);
         }
      } else if (typeof obj === 'object' && obj !== null) {
         if (obj.name === checkType) {
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

function traversePath(input: Input, path: string, pathType: PathType): any {

   let checkType: string;
   switch (pathType) {
      case PathType.Allow : {
         checkType = 'true';
         break;
      }
      case PathType.Deny : {
         checkType = 'false';
         break;
      }
   } 
   const ifConditions: any = { negative: [], positive: [] }
   const keys = path.split('.').map(key => key.replace(/\[(\d+)\]/, '.$1').replace(/^\./, '').split('.'));
   let result: any = input;
   keys.forEach(keyArr => {
      keyArr.forEach(key => {
         if (typeof result !== 'undefined' && result !== null && key in result) {
            if (result.name == "conditional") {
               if (result.conf.else.name == checkType) {
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

