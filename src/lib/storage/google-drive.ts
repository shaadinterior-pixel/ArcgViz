import type { StorageProvider, ValidationResult } from './index';

// ─── Google Drive patterns ────────────────────────────────────────────────────
// Supported share URL formats:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?export=download&id=FILE_ID  (already direct)
//   https://docs.google.com/...                             (Docs/Sheets)

const GDRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,       // /file/d/ID
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,       // open?id=ID
  /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,       // uc?id=ID
  /docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/, // Docs
];

export class GoogleDriveProvider implements StorageProvider {
  /**
   * Extract the Google Drive file ID from any known share URL format.
   * Returns null if the URL doesn't match any known pattern.
   */
  extractFileId(link: string): string | null {
    if (!link || typeof link !== 'string') return null;
    const trimmed = link.trim();
    for (const pattern of GDRIVE_PATTERNS) {
      const match = trimmed.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  /**
   * Generate a direct download URL from a Google Drive file ID.
   * This URL prompts the browser to download the file directly.
   */
  generateDirectUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  /**
   * Validate a Google Drive share link.
   * Checks format only — does not verify the file still exists (would need Google API).
   */
  validateLink(link: string): ValidationResult {
    if (!link?.trim()) {
      return { valid: false, error: 'No link provided' };
    }

    if (!link.includes('google.com')) {
      return { valid: false, error: 'Not a Google Drive link' };
    }

    const fileId = this.extractFileId(link);
    if (!fileId) {
      return {
        valid: false,
        error: 'Could not extract file ID. Make sure the link is a valid Google Drive share URL.',
      };
    }

    const downloadUrl = this.generateDirectUrl(fileId);
    return { valid: true, fileId, downloadUrl };
  }
}

// Singleton instance — import this anywhere on the server side
export const googleDriveProvider = new GoogleDriveProvider();

// ─── Future providers skeleton ────────────────────────────────────────────────
// export class CloudflareR2Provider implements StorageProvider { ... }
// export class AWSS3Provider implements StorageProvider { ... }
