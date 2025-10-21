import { StateManager } from './state.js';
import { CryptoService } from './crypto.js';
import { StorageService } from './storage.js';
import { SyncService } from './sync.js';

class MedRecordApp {
  constructor() {
    this.state = new StateManager();
    this.crypto = new CryptoService();
    this.storage = new StorageService();
    this.sync = new SyncService();
    
    this.init();
  }

  async init() {
    await this.crypto.init();
    await this.storage.init();
    await this.registerServiceWorker();
    
    this.setupEventListeners();
    this.setupNetworkMonitoring();
    this.renderView('dashboard');
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registered:', registration.scope);
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const view = e.target.dataset.view;
        this.renderView(view);
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    this.state.addEventListener('statechange', e => {
      this.handleStateChange(e.detail);
    });
  }

  setupNetworkMonitoring() {
    const updateStatus = () => {
      const indicator = document.getElementById('online-status');
      const syncStatus = document.getElementById('sync-status');
      
      if (navigator.onLine) {
        indicator.classList.remove('offline');
        syncStatus.textContent = 'Online';
        this.sync.attemptSync();
      } else {
        indicator.classList.add('offline');
        syncStatus.textContent = 'Offline';
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }

  renderView(viewName) {
    const content = document.getElementById('main-content');
    
    switch (viewName) {
      case 'dashboard':
        content.innerHTML = this.renderDashboard();
        break;
      case 'patients':
        content.innerHTML = this.renderPatients();
        break;
      case 'records':
        content.innerHTML = this.renderRecords();
        break;
      case 'settings':
        content.innerHTML = this.renderSettings();
        break;
      default:
        content.innerHTML = '<p>View not found</p>';
    }
    
    this.attachViewEventListeners(viewName);
  }

  renderDashboard() {
    return `
      <div class="card">
        <h2 class="card-title">Dashboard</h2>
        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Active Patients</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Records Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">Secure</div>
            <div class="stat-label">Encryption Status</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2 class="card-title">Quick Actions</h2>
        <button class="btn btn-primary">New Patient Record</button>
        <button class="btn btn-secondary">Sync Now</button>
      </div>
    `;
  }

  renderPatients() {
    return `
      <div class="card">
        <h2 class="card-title">Patient Management</h2>
        <button class="btn btn-primary" id="add-patient">Add New Patient</button>
        <div id="patient-list" class="patient-list">
          <p>No patients yet. Add your first patient to get started.</p>
        </div>
      </div>
    `;
  }

  renderRecords() {
    return `
      <div class="card">
        <h2 class="card-title">Medical Records</h2>
        <div id="records-list">
          <p>No records available.</p>
        </div>
      </div>
    `;
  }

  renderSettings() {
    return `
      <div class="card">
        <h2 class="card-title">Settings</h2>
        <div class="form-group">
          <label class="form-label">Clinic Name</label>
          <input type="text" class="form-input" placeholder="Enter clinic name">
        </div>
        <div class="form-group">
          <label class="form-label">Your Role</label>
          <select class="form-input">
            <option>Doctor</option>
            <option>Nurse</option>
            <option>Admin</option>
          </select>
        </div>
        <button class="btn btn-primary">Save Settings</button>
      </div>
      
      <div class="card">
        <h2 class="card-title">Security</h2>
        <button class="btn btn-secondary" id="export-keys">Export Encryption Keys</button>
        <button class="btn btn-secondary" id="generate-keys">Regenerate Keys</button>
      </div>
    `;
  }

  attachViewEventListeners(viewName) {
    if (viewName === 'settings') {
      document.getElementById('export-keys')?.addEventListener('click', () => {
        this.exportKeys();
      });
      
      document.getElementById('generate-keys')?.addEventListener('click', () => {
        this.generateKeys();
      });
    }
  }

  async exportKeys() {
    try {
      const keys = await this.crypto.exportKeys();
      const blob = new Blob([JSON.stringify(keys, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medrecord-keys.json';
      a.click();
      URL.revokeObjectURL(url);
      
      this.showNotification('Keys exported successfully', 'success');
    } catch (error) {
      this.showNotification('Failed to export keys', 'error');
    }
  }

  async generateKeys() {
    if (confirm('This will replace your existing encryption keys. Continue?')) {
      try {
        await this.crypto.generateKeys();
        this.showNotification('New keys generated successfully', 'success');
      } catch (error) {
        this.showNotification('Failed to generate keys', 'error');
      }
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }

  handleStateChange(changes) {
    console.log('State changed:', changes);
  }
}

// Initialize app
const app = new MedRecordApp();
