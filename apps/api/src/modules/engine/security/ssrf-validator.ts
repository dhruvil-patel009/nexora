import * as dns from 'dns/promises';
import { BadRequestException } from '@nestjs/common';

export class SsrfValidator {
  /**
   * Validates a target URL against SSRF vulnerabilities.
   * Resolves the DNS hostname to ensure it does not point to loopback,
   * RFC 1918 private subnets, link-local, or cloud instance metadata endpoints.
   */
  static async validateUrl(rawUrl: string): Promise<{ hostname: string; resolvedIp: string }> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new BadRequestException(`Invalid URL format: "${rawUrl}"`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are allowed.`);
    }

    const hostname = parsed.hostname.toLowerCase();

    // Disallow raw localhost and obvious internal aliases
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      throw new BadRequestException(`SSRF Protection: Access to loopback/local host "${hostname}" is prohibited.`);
    }

    // Resolve DNS to verify actual destination IP (prevents DNS-rebinding / local IP alias tricks)
    let addresses: Array<{ address: string; family: number }>;
    try {
      addresses = await dns.lookup(hostname, { all: true });
    } catch (err: any) {
      throw new BadRequestException(`DNS resolution failed for host "${hostname}": ${err.message}`);
    }

    if (!addresses || addresses.length === 0) {
      throw new BadRequestException(`Could not resolve host "${hostname}" to any IP address.`);
    }

    // Check all resolved addresses (both IPv4 and IPv6)
    for (const addr of addresses) {
      const ip = addr.address;
      if (this.isPrivateOrRestrictedIp(ip)) {
        throw new BadRequestException(
          `SSRF Protection: Host "${hostname}" resolves to restricted private address "${ip}". Outbound request blocked.`,
        );
      }
    }

    return { hostname, resolvedIp: addresses[0].address };
  }

  /**
   * Checks whether an IP address belongs to private, loopback, or metadata ranges.
   */
  static isPrivateOrRestrictedIp(ip: string): boolean {
    // IPv4 checks
    if (ip.includes('.')) {
      const parts = ip.split('.').map((p) => parseInt(p, 10));
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        return true; // malformed IP is treated as restricted
      }

      const [b0, b1] = parts;

      // 127.0.0.0/8 (Loopback)
      if (b0 === 127) return true;

      // 10.0.0.0/8 (Private RFC 1918)
      if (b0 === 10) return true;

      // 172.16.0.0/12 (Private RFC 1918: 172.16.x.x - 172.31.x.x)
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

      // 192.168.0.0/16 (Private RFC 1918)
      if (b0 === 192 && b1 === 168) return true;

      // 169.254.0.0/16 (Link-Local & Cloud Metadata 169.254.169.254)
      if (b0 === 169 && b1 === 254) return true;

      // 0.0.0.0/8 (Current network)
      if (b0 === 0) return true;

      // 100.64.0.0/10 (Shared Address Space / CGNAT)
      if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

      // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
      if (b0 >= 224) return true;

      return false;
    }

    // IPv6 checks
    const normalized = ip.toLowerCase();
    if (
      normalized === '::1' ||
      normalized === '::' ||
      normalized.startsWith('fe80:') || // link-local
      normalized.startsWith('fc') ||    // unique local
      normalized.startsWith('fd')
    ) {
      return true;
    }

    return false;
  }
}
