import type { HeaderValue } from './header-value.js';
import { parseParams, quote } from './param-values.js';
import { capitalize, isValidDate } from './utils.js';

type SameSiteValue = 'Strict' | 'Lax' | 'None';

/**
 * Represents the value of a `Set-Cookie` HTTP header.
 */
export class SetCookie implements HeaderValue {
  public domain?: string;
  public expires?: Date;
  public httpOnly?: true;
  public maxAge?: number;
  public name?: string;
  public path?: string;
  public sameSite?: SameSiteValue;
  public secure?: true;
  public value?: string;

  constructor(initialValue?: string) {
    if (initialValue) {
      let params = parseParams(initialValue);
      if (params.length > 0) {
        this.name = params[0][0];
        this.value = params[0][1];

        for (let [key, value] of params.slice(1)) {
          switch (key.toLowerCase()) {
            case 'domain':
              this.domain = value;
              break;
            case 'expires': {
              if (typeof value === 'string') {
                let v = new Date(value);
                if (isValidDate(v)) this.expires = v;
              }
              break;
            }
            case 'httponly':
              this.httpOnly = true;
              break;
            case 'max-age': {
              if (typeof value === 'string') {
                let v = parseInt(value, 10);
                if (!isNaN(v)) this.maxAge = v;
              }
              break;
            }
            case 'path':
              this.path = value;
              break;
            case 'samesite':
              if (typeof value === 'string' && /strict|lax|none/i.test(value)) {
                this.sameSite = capitalize(value) as SameSiteValue;
              }
              break;
            case 'secure':
              this.secure = true;
              break;
          }
        }
      }
    }
  }

  toString(): string {
    if (!this.name) {
      return '';
    }

    let parts = [`${this.name}=${quote(this.value || '')}`];

    if (this.domain) {
      parts.push(`Domain=${this.domain}`);
    }
    if (this.path) {
      parts.push(`Path=${this.path}`);
    }
    if (this.expires) {
      parts.push(`Expires=${this.expires.toUTCString()}`);
    }
    if (this.maxAge) {
      parts.push(`Max-Age=${this.maxAge}`);
    }
    if (this.secure) {
      parts.push('Secure');
    }
    if (this.httpOnly) {
      parts.push('HttpOnly');
    }
    if (this.sameSite) {
      parts.push(`SameSite=${this.sameSite}`);
    }

    return parts.join('; ');
  }
}
