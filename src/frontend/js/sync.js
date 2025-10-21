export class SyncService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_WORKER_URL || 'https://api.medrecord.space';
    this.syncInProgress = false;
  }

  async attemptSync() {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;

    try {
      const storage = window.app.storage;
      const crypto = window.app.crypto;
      const queue = await storage.getSyncQueue();

      for (const item of queue) {
        const encrypted = await crypto.encrypt(item.data);
        const signature = await crypto.sign(encrypted);

        await this.syncToServer({
          encrypted,
          signature,
          type: item.type,
          timestamp: item.timestamp,
        });
      }

      await storage.clearSyncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncToServer(payload) {
    const response = await fetch(`${this.apiUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    return response.json();
  }

  async fetchFromServer(query) {
    const response = await fetch(`${this.apiUrl}/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    return response.json();
  }
}
