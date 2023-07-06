import { PathType, getRegoPolicy } from "./convertor";

describe ('Get allowed path conditions', () => {
    it ('one condition allowed policy', () => {
        const jsonString = `{
            "validators": [
              {
                "name": "conditional",
                "conf": {
                  "if": [
                    {
                      "conf": {
                        "fields": [
                          {
                            "comparator": "contains",
                            "field": "authnCtx.scp",
                            "value": [
                              "email",
                              "profile"
                            ]
                          }
                        ]
                      },
                      "name": "attributes"
                    }
                  ],
                  "then": {
                    "conf": {},
                    "name": "false"
                  },
                  "else": {
                    "conf": {},
                    "name": "true"
                  }
                }
              }
            ]
        }`

        const allowedConditions = getRegoPolicy(jsonString, PathType.Allow);
        const input: any = JSON.parse(jsonString)
        expect(allowedConditions[0].negative.length).toEqual(1);
        expect(allowedConditions[0].positive.length).toEqual(0);
        expect(input.validators[0].conf.if).toStrictEqual(allowedConditions[0].negative[0]);
    })

    it ('one condition denied policy', () => {
      const jsonString = `{
          "validators": [
            {
              "name": "conditional",
              "conf": {
                "if": [
                  {
                    "conf": {
                      "fields": [
                        {
                          "comparator": "contains",
                          "field": "authnCtx.scp",
                          "value": [
                            "email",
                            "profile"
                          ]
                        }
                      ]
                    },
                    "name": "attributes"
                  }
                ],
                "then": {
                  "conf": {},
                  "name": "false"
                },
                "else": {
                  "conf": {},
                  "name": "true"
                }
              }
            }
          ]
      }`

      const allowedConditions = getRegoPolicy(jsonString, PathType.Deny);
      const input: any = JSON.parse(jsonString)
      expect(allowedConditions[0].negative.length).toEqual(0);
      expect(allowedConditions[0].positive.length).toEqual(1);
      expect(input.validators[0].conf.if).toStrictEqual(allowedConditions[0].positive[0]);
  })

    it('multi conditions allowed policy', () => {
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

      const allowedConditions = getRegoPolicy(jsonString, PathType.Allow);
      const input: any = JSON.parse(jsonString)
      expect(allowedConditions[0].negative.length).toEqual(2);
      expect(allowedConditions[0].positive.length).toEqual(0);
    })
})
