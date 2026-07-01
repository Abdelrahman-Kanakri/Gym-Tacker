interface MaybeAuthError {
  message?: string;
}

export function getAuthErrorMessage(error: MaybeAuthError | null): string | null {
  if (!error) return null;
  const message = error.message?.trim();
  return message ? message : 'Something went wrong. Please try again.';
}
