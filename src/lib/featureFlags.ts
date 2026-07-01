// Email/password signup and reset require a verified sending domain in Resend
// (the sandbox sender only delivers to the Resend account's own address).
// Flip this back on once a domain is verified.
export const EMAIL_PASSWORD_AUTH_ENABLED = false;
