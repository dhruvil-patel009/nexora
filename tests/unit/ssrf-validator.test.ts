import { describe, it, expect } from 'vitest';
import { SsrfValidator } from '../../apps/api/src/modules/engine/security/ssrf-validator';

describe('SsrfValidator - Outbound SSRF Guard', () => {
  it('blocks loopback destination: 127.0.0.1 and localhost', async () => {
    await expect(SsrfValidator.validateUrl('http://127.0.0.1:8080/admin')).rejects.toThrow(
      /SSRF Protection: Access to loopback\/local host/,
    );

    await expect(SsrfValidator.validateUrl('http://localhost:3000/api')).rejects.toThrow(
      /SSRF Protection: Access to loopback\/local host/,
    );
  });

  it('blocks cloud metadata endpoint (169.254.169.254)', async () => {
    await expect(
      SsrfValidator.validateUrl('http://169.254.169.254/latest/meta-data/'),
    ).rejects.toThrow(/SSRF Protection|restricted private address/);
  });

  it('rejects unsupported protocols (file://, ftp://, gopher://)', async () => {
    await expect(SsrfValidator.validateUrl('file:///etc/passwd')).rejects.toThrow(
      /Unsupported protocol "file:"/,
    );

    await expect(SsrfValidator.validateUrl('ftp://example.com/file')).rejects.toThrow(
      /Unsupported protocol "ftp:"/,
    );
  });

  it('identifies RFC 1918 private IPv4 subnets as restricted', () => {
    // 10.0.0.0/8
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('10.0.0.1')).toBe(true);
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('10.255.255.255')).toBe(true);

    // 172.16.0.0/12
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('172.16.0.1')).toBe(true);
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('172.31.255.255')).toBe(true);

    // 192.168.0.0/16
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('192.168.1.1')).toBe(true);
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('192.168.254.254')).toBe(true);

    // Public IPs should not be restricted
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('8.8.8.8')).toBe(false);
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('1.1.1.1')).toBe(false);
    expect((SsrfValidator as any).isPrivateOrRestrictedIp('142.250.190.46')).toBe(false);
  });
});
