use serde::{Deserialize, Serialize};
use serde_json::{Result, Value};
use either::Either;

#[derive(Serialize, Deserialize)]
struct Attribute {
    name: String,
    #[serde(rename = "type")]
    type_: String,
}

#[derive(Serialize, Deserialize)]
struct Property {
    attribute: Attribute,
    operator: String,
    value: Vec<String>,
}

type Paths = Vec<Vec<Property>>;

pub fn validate_tunnel_policy(policy_string: &str, input_string: &str) -> bool {

    let paths: Result<Paths> = serde_json::from_str(policy_string);
    let input: Value = serde_json::from_str(input_string).expect("Invalid input JSON");
    match paths {
        Ok(paths) => {
            for path in paths {
                let mut all_conditions_met: bool = false;
                for property in path {
                    if let Some(value) = get_value_from_input(&input, &property.attribute.name) {
                        match value {
                            Either::Left(single_value) => {
                                match property.operator.as_str() {
                                    "equal" => {
                                        if single_value == property.value[0] {
                                            all_conditions_met = true;
                                        }
                                    },
                                    "not_equal" => {
                                        if single_value != property.value[0] {
                                            all_conditions_met = true;
                                        }
                                    },
                                    _ => {
                                        break;
                                    }
                                }
                            },
                            Either::Right(values) => {
                                match property.operator.as_str() {
                                    "contains" => {
                                        if !values.is_empty() && values.contains(&property.value[0]) {
                                            all_conditions_met = true;
                                        }
                                    },
                                    _ => {
                                        break;
                                    }
                            }
                        }
                    }
                }
            }
            return all_conditions_met;
            }
            false
        }
        Err(_) => {
            // Handle error appropriately, possibly logging or returning a default value
            false
        }
    }
}

fn get_value_from_input(input: &Value, attribute_name: &str) -> Option<Either<String, Vec<String>>> {

    let attribute_path: Vec<&str> = attribute_name.split('.').collect();
    let mut current_value = input;

    for key in attribute_path.iter() {
        current_value = match current_value {
            Value::Object(obj) => obj.get(*key)?,
            _ => return None, // Early return if the current value is not an object
        };
    }

    match current_value {
        Value::String(s) => Some(Either::Left(s.clone())),
        Value::Array(arr) => {
            let strings: Option<Vec<String>> = arr.iter().map(|v| {
                if let Value::String(s) = v {
                    Some(s.clone())
                } else {
                    None // Return None if any of the values in the array is not a string
                }
            }).collect();
            strings.map(Either::Right)
        },
        _ => None // Return None if the value is neither a string nor an array of strings
    }
}


fn main() {
    // Example JSON string
    let policy_string = r#"[
        [
          {
            "attribute": {
              "name": "authn_ctx.scp",
              "type": "array"
            },
            "operator": "contains",
            "value": [
              "email"
            ]
          }
        ]
      ]"#;

    let json_input = r#"
    {
        "authn_ctx": {
            "scp": [
                "openid",
                "profile",
                "email",
                "sample_service:read"
            ],
            "sub": "joe",
            "idp_id": "4abc18656e1d79589b6a6ba8afcb350a02623c6f5d39f43c3bcc47b697e92538",
            "groups": [
                "admins",
                "users"
            ],
            "email": "testjoe@cloudentity.com",
            "email_verified": true,
            "phone_number": "+1-555-6616-899",
            "phone_number_verified": "+1-555-6616-899",
            "address": {
                "formatted": "",
                "street_address": "1463  Perry Street",
                "locality": "Dayton",
                "region": "Kentucky",
                "country": "US",
                "postal_code": "41074"
            },
            "name": "Joe Test",
            "given_name": "Joe",
            "middle_name": "",
            "family_name": "Test",
            "nickname": "joe",
            "preferred_username": "testjoe",
            "profile": "",
            "picture": "",
            "website": "",
            "gender": "male",
            "birthdate": "1960-10-09",
            "zoneinfo": "",
            "locale": "",
            "updated_at": ""
        },
        "contexts": {
            "scopes": {
                "users.*": [
                    {
                        "params": [
                            "joe"
                        ],
                        "requested_name": "users.joe"
                    }
                ]
            },
            "workspaceMetadata": {
                "sap_id": "123456789"
            }
        },
        "request": {
            "headers": {
                "Content-Type": [
                    "application/json"
                ],
                "X-Custom-Header": [
                    "BOT_DETECTED"
                ]
            },
            "method": "POST",
            "path_params": {
                "users": "admins"
            },
            "query_params": {
                "limit": [
                    "1000"
                ],
                "offset": [
                    "100"
                ]
            },
            "path": "/doawesomethings"
        }
    }"#;

    // Call the function with the JSON string
    let result = validate_tunnel_policy(policy_string, json_input);
    println!("Policy valid: {}", result);
}
