import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';

describe('isValidReturnToPath', () => {
  it.each([
    '/settings/accounts?tab=emails&filter=unread#inbox',
    '/objects/people#selected',
    '/settings/accounts?reference=https://example.com',
  ])('accepts relative application destination %s', (path) => {
    expect(isValidReturnToPath(path)).toBe(true);
  });

  it.each([
    'https://evil.example/settings/accounts',
    '//evil.example/settings/accounts',
    '/settings\\accounts?tab=emails',
    '/welcome?returnToPath=/settings/accounts',
    '/create/profile#pending',
    '/reset-password?tab=emails',
  ])('rejects unsafe or excluded destination %s', (path) => {
    expect(isValidReturnToPath(path)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidReturnToPath('')).toBe(false);
  });

  it('should return false for root path', () => {
    expect(isValidReturnToPath('/')).toBe(false);
  });

  it('should return false for paths not starting with slash', () => {
    expect(isValidReturnToPath('objects/people')).toBe(false);
  });

  it('should return false for double-slash paths', () => {
    expect(isValidReturnToPath('//evil.com')).toBe(false);
  });

  it('should return false for backslash-tricked paths', () => {
    expect(isValidReturnToPath('/\\evil.com')).toBe(false);
    expect(isValidReturnToPath('/\\/evil.com')).toBe(false);
    expect(isValidReturnToPath('/objects\\..\\evil')).toBe(false);
  });

  it('should return false for onboarding paths', () => {
    expect(isValidReturnToPath('/workspace-activation')).toBe(false);
    expect(isValidReturnToPath('/create/profile')).toBe(false);
  });

  it('should return false for sign-in paths', () => {
    expect(isValidReturnToPath('/welcome')).toBe(false);
    expect(isValidReturnToPath('/verify')).toBe(false);
  });

  it('should return false for reset-password paths', () => {
    expect(isValidReturnToPath('/reset-password')).toBe(false);
  });

  it('should return true for valid application paths', () => {
    expect(isValidReturnToPath('/objects/people')).toBe(true);
    expect(isValidReturnToPath('/settings/accounts')).toBe(true);
  });
});
