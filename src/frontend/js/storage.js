export class StorageService {
  constructor() {
    this.db = null;
    this.dbName = 'medrecord-db';
    this.version = 1;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('patients')) {
          const patientsStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
          patientsStore.createIndex('email', 'email', { unique: false });
          patientsStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('records')) {
          const recordsStore = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
          recordsStore.createIndex('patientId', 'patientId', { unique: false });
          recordsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async addPatient(patient) {
    return this.add('patients', patient);
  }

  async getPatient(id) {
    return this.get('patients', id);
  }

  async getAllPatients() {
    return this.getAll('patients');
  }

  async addRecord(record) {
    return this.add('records', record);
  }

  async getRecordsByPatient(patientId) {
    return this.getByIndex('records', 'patientId', patientId);
  }

  async add(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(item) {
    return this.add('sync-queue', item);
  }

  async getSyncQueue() {
    return this.getAll('sync-queue');
  }

  async clearSyncQueue() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sync-queue'], 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
