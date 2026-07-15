import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DEFAULT_UPLOAD_EXPIRY_SECONDS = 15 * 60;
const DEFAULT_DOWNLOAD_EXPIRY_SECONDS = 60 * 60;
const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024;

export type R2UploadTicket = {
  uploadUrl: string;
  objectKey: string;
  downloadUrl: string;
  expiresIn: number;
};

type R2Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
  maxUploadBytes: number;
};

function cleanEnv(value: string | undefined): string {
  return (value || '').trim().replace(/^"|"$/g, '');
}

function getR2Config(): R2Config {
  const accountId = cleanEnv(process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID);
  const endpoint = cleanEnv(process.env.R2_ENDPOINT) || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
  const bucket = cleanEnv(process.env.R2_BUCKET_NAME);
  const accessKeyId = cleanEnv(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = cleanEnv(process.env.R2_SECRET_ACCESS_KEY);
  const publicBaseUrl = cleanEnv(process.env.R2_PUBLIC_BASE_URL);
  const maxUploadBytes = Number(cleanEnv(process.env.R2_MAX_UPLOAD_BYTES)) || DEFAULT_MAX_UPLOAD_BYTES;

  const missing = [
    !endpoint && 'R2_ENDPOINT or R2_ACCOUNT_ID',
    !bucket && 'R2_BUCKET_NAME',
    !accessKeyId && 'R2_ACCESS_KEY_ID',
    !secretAccessKey && 'R2_SECRET_ACCESS_KEY',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Cloudflare R2 is not configured. Missing: ${missing.join(', ')}`);
  }

  return { endpoint, bucket, accessKeyId, secretAccessKey, publicBaseUrl, maxUploadBytes };
}

function getR2Client(config = getR2Config()): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function sanitizeFileName(fileName: string): string {
  const fallback = 'asset.zip';
  const trimmed = (fileName || fallback).trim();
  const parts = trimmed.split(/[\\/]/);
  const base = parts[parts.length - 1] || fallback;
  return base
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 120) || fallback;
}

function buildObjectKey(fileName: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `product-zips/${year}/${month}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

function toStoredDownloadUrl(objectKey: string, config = getR2Config()): string {
  if (!config.publicBaseUrl) return `r2://${objectKey}`;
  return `${config.publicBaseUrl.replace(/\/+$/, '')}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
}

export function extractR2ObjectKey(value: string): string | null {
  const raw = cleanEnv(value);
  if (!raw) return null;
  if (raw.startsWith('r2://')) return raw.slice('r2://'.length);

  const publicBaseUrl = cleanEnv(process.env.R2_PUBLIC_BASE_URL);
  if (publicBaseUrl && raw.startsWith(publicBaseUrl.replace(/\/+$/, '') + '/')) {
    try {
      const url = new URL(raw);
      return url.pathname.replace(/^\/+/, '').split('/').map(decodeURIComponent).join('/');
    } catch {
      return null;
    }
  }

  return null;
}

export function getR2MaxUploadBytes(): number {
  return getR2Config().maxUploadBytes;
}

export async function createR2UploadTicket(input: {
  fileName: string;
  contentType?: string;
  size: number;
}): Promise<R2UploadTicket> {
  const config = getR2Config();
  const fileName = sanitizeFileName(input.fileName);
  const contentType = input.contentType || 'application/zip';

  if (!fileName.toLowerCase().endsWith('.zip')) {
    throw new Error('Only .zip files are allowed for product downloads.');
  }

  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new Error('Invalid file size.');
  }

  if (input.size > config.maxUploadBytes) {
    throw new Error(`File is too large. Max allowed size is ${Math.round(config.maxUploadBytes / 1024 / 1024)} MB.`);
  }

  const objectKey = buildObjectKey(fileName);
  const client = getR2Client(config);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: DEFAULT_UPLOAD_EXPIRY_SECONDS });

  return {
    uploadUrl,
    objectKey,
    downloadUrl: toStoredDownloadUrl(objectKey, config),
    expiresIn: DEFAULT_UPLOAD_EXPIRY_SECONDS,
  };
}

export async function createR2SignedDownloadUrl(objectKey: string): Promise<string> {
  const config = getR2Config();
  const client = getR2Client(config);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
    }),
    { expiresIn: DEFAULT_DOWNLOAD_EXPIRY_SECONDS },
  );
}
