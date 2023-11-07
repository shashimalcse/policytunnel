use serde::{Deserialize, Serialize};
use serde_json::{Result, Value};
use either::Either;

use wasm_bindgen::prelude::*;

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

#[wasm_bindgen]
pub fn validate_tunnel_policy(policy_string: &str, input_string: &str) -> bool {

    let paths: Result<Paths> = serde_json::from_str(policy_string);
    let input: Value = serde_json::from_str(input_string).expect("Invalid input JSON");
    match paths {
        Ok(paths) => {
            for path in paths {
                let mut all_conditions_met: bool = true;
                for property in path {
                    if let Some(value) = get_value_from_input(&input, &property.attribute.name) {
                        match value {
                            Either::Left(single_value) => {
                                match property.operator.as_str() {
                                    "equal" => {
                                        if single_value != property.value[0] {
                                            all_conditions_met = false;
                                        }
                                    },
                                    "not_equal" => {
                                        if single_value == property.value[0] {
                                            all_conditions_met = false;
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
                                        if !values.is_empty() && !values.contains(&property.value[0]) {
                                            all_conditions_met = false;
                                        }
                                    },
                                    "not_contains" => {
                                        if !values.is_empty() && values.contains(&property.value[0]) {
                                            all_conditions_met = false;
                                        }
                                    },
                                    "contain_at_least_one" => {
                                        all_conditions_met = property.value.iter().any(|val| !values.contains(val));
                                    },
                                    "not_contain_at_least_one" => {
                                        all_conditions_met = property.value.iter().any(|val| values.contains(val));
                                    }
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
