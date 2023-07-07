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
                          "comparator": "equals",
                          "field": "authnCtx.gender",
                          "value": "female"
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
        const policy = getRegoPolicy(jsonString, PathType.Allow);
        expect(policy).toEqual(`package example\r\nimport future.keywords.if\r\ndefault allow := false\r\nattributes_equals if input.authnCtx.gender == "female"\r\nallow {\r\nnot attributes_equals\r\n}`);
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
                                "comparator":"equals",
                                "field":"authnCtx.username",
                                "value":"shashimal"
                              }
                            ]
                        },
                        "name":"context"
                      }
                  ],
                  "then": {
                        "conf":{
                            "if":[
                              {
                                  "conf":{
                                    "fields":[
                                        {
                                          "comparator":"not_equals",
                                          "field":"authnCtx.gender",
                                          "value":"female"
                                        }
                                    ]
                                  },
                                  "name":"context"
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
                        "name":"false"
                  }
                }
            }
          ]
      }`;

      const policy = getRegoPolicy(jsonString, PathType.Allow);
      expect(policy).toEqual(`package example\r\nimport future.keywords.if\r\ndefault allow := false\r\ncontext_equals if input.authnCtx.username == "shashimal"\r\ncontext_not_equals if input.authnCtx.gender != "female"\r\nallow {\r\ncontext_equals\r\nnot context_not_equals\r\n}`);
    })
})
