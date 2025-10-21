import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../../src/frontend/js/storage.js';

describe('StorageService', () => {
  let storage;

  beforeEach(() => {
    storage = new StorageService();
  });

  it('should initialize database', async () => {
    await expect(storage.init()).resolves.not.toThrow();
  });

  it('should add and retrieve patients', async () => {
    await storage.init();
    
    const patient = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const id = await storage.addPatient(patient);
    expect(id).toBeDefined();

    const retrieved = await storage.getPatient(id);
    expect(retrieved.name).toBe(patient.name);
  });
});
