import * as crypto from 'crypto';

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16; // 16 bytes for AES-GCM
  private static readonly KEY_SALT = 'nexora-gcm-key-derivation-salt';

  /**
   * Derives a deterministic 32-byte key from master secret using SHA-256.
   */
  private static deriveKey(masterSecret?: string): Buffer {
    const secret =
      masterSecret ||
      process.env.CREDENTIAL_ENCRYPTION_KEY ||
      'nexora-development-master-encryption-key-32b!';
    return crypto.createHash('sha256').update(`${this.KEY_SALT}:${secret}`).digest();
  }

  /**
   * Encrypts plaintext string using AES-256-GCM with a fresh random 16-byte IV.
   */
  static encrypt(plaintext: string, masterSecret?: string): EncryptedPayload {
    if (typeof plaintext !== 'string') {
      throw new Error('Plaintext to encrypt must be a string');
    }

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = this.deriveKey(masterSecret);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  /**
   * Decrypts ciphertext hex string using AES-256-GCM verifying auth tag.
   */
  static decrypt(
    encryptedData: string,
    ivHex: string,
    authTagHex: string,
    masterSecret?: string,
  ): string {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = this.deriveKey(masterSecret);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
