import { describe, it, expect } from 'vitest';
import { EncryptionService } from '../../apps/api/src/modules/credentials/encryption.service';

describe('EncryptionService - AES-256-GCM Vault', () => {
  const masterKey = 'test-suite-master-key-32-bytes-secure!';

  it('encrypts and successfully decrypts plaintext string', () => {
    const secret = 'sk_live_51M0...sample-production-stripe-secret';
    const encrypted = EncryptionService.encrypt(secret, masterKey);

    expect(encrypted.encryptedData).toBeDefined();
    expect(encrypted.iv).toHaveLength(32); // 16 bytes in hex = 32 chars
    expect(encrypted.authTag).toHaveLength(32); // 16 bytes in hex = 32 chars

    const decrypted = EncryptionService.decrypt(
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.authTag,
      masterKey,
    );
    expect(decrypted).toBe(secret);
  });

  it('generates unique random IVs on subsequent encryptions of identical plaintext', () => {
    const secret = 'identical-secret-value';
    const enc1 = EncryptionService.encrypt(secret, masterKey);
    const enc2 = EncryptionService.encrypt(secret, masterKey);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.encryptedData).not.toBe(enc2.encryptedData);

    // Both should still decrypt to the exact same plaintext
    expect(EncryptionService.decrypt(enc1.encryptedData, enc1.iv, enc1.authTag, masterKey)).toBe(secret);
    expect(EncryptionService.decrypt(enc2.encryptedData, enc2.iv, enc2.authTag, masterKey)).toBe(secret);
  });

  it('throws an error if ciphertext has been tampered with (Authenticated GCM verification)', () => {
    const secret = 'my-vault-secret';
    const encrypted = EncryptionService.encrypt(secret, masterKey);

    // Alter one character in the encrypted data
    const corruptedData =
      encrypted.encryptedData.slice(0, -2) + (encrypted.encryptedData.endsWith('aa') ? 'bb' : 'aa');

    expect(() =>
      EncryptionService.decrypt(corruptedData, encrypted.iv, encrypted.authTag, masterKey),
    ).toThrow();
  });

  it('throws an error if authentication tag is invalid or tampered', () => {
    const secret = 'another-secret';
    const encrypted = EncryptionService.encrypt(secret, masterKey);

    const corruptedTag = '00000000000000000000000000000000';

    expect(() =>
      EncryptionService.decrypt(encrypted.encryptedData, encrypted.iv, corruptedTag, masterKey),
    ).toThrow();
  });
});
