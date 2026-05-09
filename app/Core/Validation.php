<?php

namespace App\Core;

class Validation {
    protected array $errors = [];

    public function validate($data, $rules) {
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $rulesArray = explode('|', $fieldRules);

            foreach ($rulesArray as $rule) {
                if ($rule === 'required' && empty($value)) {
                    $this->addError($field, "$field is required");
                } elseif ($rule === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "Invalid email format");
                } elseif (strpos($rule, 'min:') === 0) {
                    $min = (int)substr($rule, 4);
                    if (strlen($value) < $min) {
                        $this->addError($field, "$field must be at least $min characters");
                    }
                }
                // Add more rules as needed
            }
        }
        return empty($this->errors);
    }

    protected function addError($field, $message) {
        $this->errors[$field] = $message;
    }

    public function getErrors() {
        return $this->errors;
    }
}
