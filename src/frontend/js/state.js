export class StateManager extends EventTarget {
  constructor() {
    super();
    this.state = {
      user: null,
      patients: [],
      records: [],
      settings: {},
    };
  }

  setState(updates) {
    const changes = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (this.state[key] !== value) {
        changes[key] = { old: this.state[key], new: value };
        this.state[key] = value;
      }
    }

    if (Object.keys(changes).length > 0) {
      this.dispatchEvent(new CustomEvent('statechange', { detail: changes }));
    }
  }

  getState(key) {
    return key ? this.state[key] : this.state;
  }
}
