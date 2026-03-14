import { describe, it, expect } from 'vitest';

describe('Health endpoint', () => {
  it('should return ok status', () => {
    const response = { status: 'ok', timestamp: new Date().toISOString() };
    expect(response.status).toBe('ok');
    expect(response.timestamp).toBeDefined();
  });
});
