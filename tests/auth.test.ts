import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../src/store/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns unauthenticated when no auth stored', () => {
    const auth = getStoredAuth();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
  });

  it('stores and retrieves auth', () => {
    const user = { id: '1', email: 'admin@test.com', fullName: 'Admin', role: 'admin' };
    setStoredAuth('abc-token', user);
    const stored = getStoredAuth();
    expect(stored.isAuthenticated).toBe(true);
    expect(stored.user?.email).toBe('admin@test.com');
    expect(stored.token).toBe('abc-token');
  });

  it('clears auth', () => {
    const user = { id: '1', email: 'admin@test.com', fullName: 'Admin', role: 'admin' };
    setStoredAuth('abc-token', user);
    clearStoredAuth();
    const stored = getStoredAuth();
    expect(stored.isAuthenticated).toBe(false);
    expect(stored.user).toBeNull();
  });
});
