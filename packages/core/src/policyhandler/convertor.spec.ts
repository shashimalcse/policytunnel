import { getRegoPolicy } from "./convertor";

describe ('Get allowed path conditions', () => {
    it ('one condition policy', () => {
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

        const allowedConditions = getRegoPolicy(jsonString);
        const input: any = JSON.parse(jsonString)
        expect(allowedConditions[0].negative.length).toEqual(1);
        expect(allowedConditions[0].positive.length).toEqual(0);
        expect(input.validators[0].conf.if).toStrictEqual(allowedConditions[0].negative[0]);
    })
})
