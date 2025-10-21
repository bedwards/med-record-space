import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from '../../src/frontend/js/crypto.js';

describe('CryptoService', () => {
  let crypto;

  beforeEach(() => {
    crypto = new CryptoService();
  });

  it('should initialize without errors', async () => {
    await expect(crypto.init()).resolves.not.toThrow();
  });

  it('should generate keys', async () => {
    await crypto.generateKeys();
    expect(crypto.keyPair).toBeDefined();
    expect(crypto.symmetricKey).toBeDefined();
  });

  it('should encrypt and decrypt data', async () => {
    await crypto.generateKeys();
    const data = { test: 'data' };
    
    const encrypted = await crypto.encrypt(data);
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('data');

    const decrypted = await crypto.decrypt(encrypted);
    expect(decrypted).toEqual(data);
  });
});
