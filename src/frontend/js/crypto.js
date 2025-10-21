export class CryptoService {
  constructor() {
    this.keyPair = null;
    this.symmetricKey = null;
  }

  async init() {
    await this.loadOrGenerateKeys();
  }

  async loadOrGenerateKeys() {
    const storedKeys = localStorage.getItem('crypto-keys');
    
    if (storedKeys) {
      await this.importKeys(JSON.parse(storedKeys));
    } else {
      await this.generateKeys();
    }
  }

  async generateKeys() {
    // Generate RSA key pair for signing
    this.keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify']
    );

    // Generate AES key for encryption
    this.symmetricKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    await this.storeKeys();
  }

  async storeKeys() {
    const publicKey = await crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('jwk', this.keyPair.privateKey);
    const symmetricKey = await crypto.subtle.exportKey('jwk', this.symmetricKey);

    localStorage.setItem('crypto-keys', JSON.stringify({
      publicKey,
      privateKey,
      symmetricKey,
    }));
  }

  async importKeys(keys) {
    this.keyPair = {
      publicKey: await crypto.subtle.importKey(
        'jwk',
        keys.publicKey,
        { name: 'RSA-PSS', hash: 'SHA-256' },
        true,
        ['verify']
      ),
      privateKey: await crypto.subtle.importKey(
        'jwk',
        keys.privateKey,
        { name: 'RSA-PSS', hash: 'SHA-256' },
        true,
        ['sign']
      ),
    };

    this.symmetricKey = await crypto.subtle.importKey(
      'jwk',
      keys.symmetricKey,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.symmetricKey,
      encodedData
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encryptedData)),
    };
  }

  async decrypt(encryptedObj) {
    const iv = new Uint8Array(encryptedObj.iv);
    const data = new Uint8Array(encryptedObj.data);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.symmetricKey,
      data
    );

    const decoded = new TextDecoder().decode(decryptedData);
    return JSON.parse(decoded);
  }

  async sign(data) {
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      this.keyPair.privateKey,
      encodedData
    );

    return Array.from(new Uint8Array(signature));
  }

  async verify(data, signature) {
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const signatureArray = new Uint8Array(signature);

    return await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      this.keyPair.publicKey,
      signatureArray,
      encodedData
    );
  }

  async exportKeys() {
    const publicKey = await crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('jwk', this.keyPair.privateKey);
    const symmetricKey = await crypto.subtle.exportKey('jwk', this.symmetricKey);

    return { publicKey, privateKey, symmetricKey };
  }
}
