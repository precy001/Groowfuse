<?php
/**
 * Lightweight field validators.
 * --------------------------------------------------------
 * Build up a Validator, add rules per field, then call ->errors().
 *
 * Example:
 *   $v = new Validator($_POST);
 *   $v->required('email')->email('email');
 *   $v->required('message')->maxLength('message', 5000);
 *   if ($errors = $v->errors()) fail('Validation failed.', 422, ['fields' => $errors]);
 *
 * Rules accumulate per field; the FIRST failing rule wins so the user only
 * sees one error per field at a time.
 */

declare(strict_types=1);

class Validator {
    private array $data;
    /** @var array<string,string>  field => first error message */
    private array $errors = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    /* ─── Read helpers ─── */
    public function value(string $field): ?string {
        $v = $this->data[$field] ?? null;
        if ($v === null) return null;
        if (is_array($v)) return null;          // Reject arrays for scalar fields
        $v = trim((string)$v);
        return $v === '' ? null : $v;
    }

    /**
     * Get the cleaned/trimmed value, or default if missing.
     */
    public function get(string $field, $default = null) {
        return $this->value($field) ?? $default;
    }

    public function errors(): array { return $this->errors; }
    public function valid(): bool   { return empty($this->errors); }

    /* ─── Rule registration ─── */
    private function fail(string $field, string $message): self {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    public function required(string $field, string $message = 'This field is required.'): self {
        if ($this->value($field) === null) $this->fail($field, $message);
        return $this;
    }

    public function email(string $field, string $message = 'Enter a valid email address.'): self {
        $v = $this->value($field);
        if ($v !== null && !filter_var($v, FILTER_VALIDATE_EMAIL)) {
            $this->fail($field, $message);
        }
        return $this;
    }

    public function url(string $field, string $message = 'Enter a valid URL.'): self {
        $v = $this->value($field);
        if ($v !== null && !filter_var($v, FILTER_VALIDATE_URL)) {
            $this->fail($field, $message);
        }
        return $this;
    }

    public function maxLength(string $field, int $max, ?string $message = null): self {
        $v = $this->value($field);
        if ($v !== null && mb_strlen($v) > $max) {
            $this->fail($field, $message ?? "Keep this under {$max} characters.");
        }
        return $this;
    }

    public function minLength(string $field, int $min, ?string $message = null): self {
        $v = $this->value($field);
        if ($v !== null && mb_strlen($v) < $min) {
            $this->fail($field, $message ?? "Must be at least {$min} characters.");
        }
        return $this;
    }

    public function inSet(string $field, array $allowed, ?string $message = null): self {
        $v = $this->value($field);
        if ($v !== null && !in_array($v, $allowed, true)) {
            $this->fail($field, $message ?? 'Not a valid choice.');
        }
        return $this;
    }

    /**
     * The honeypot field MUST be empty. If a bot fills it, validation fails.
     */
    public function honeypot(string $field): self {
        if (!empty($this->data[$field])) {
            // Generic message — never tell bots they tripped a trap
            $this->fail($field, 'Invalid submission.');
        }
        return $this;
    }
}
