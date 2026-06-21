// ─── Storage Provider Abstraction ────────────────────────────────────────────
// Frontend never interacts with this directly.
// Only backend API routes use StorageProvider to resolve download URLs.

export interface StorageProvider {
  /** Validate a share link and extract metadata */
  validateLink(link: string): ValidationResult;
  /** Generate a direct download URL from a file ID */
  generateDirectUrl(fileId: string): string;
  /** Extract the file ID from a share link */
  extractFileId(link: string): string | null;
}

export interface ValidationResult {
  valid: boolean;
  fileId?: string;
  downloadUrl?: string;
  error?: string;
}

export interface StorageConfig {
  provider: 'google-drive' | 'cloudflare-r2' | 'aws-s3';
}
