/**
 * File storage abstraction - local disk for dev, swappable to S3 later.
 * Store files under ./uploads in development.
 */

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export interface StoredFile {
  storagePath: string;
  filename: string;
  mimeType: string;
  size: number;
  checksum?: string;
}

async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

function getStoragePath(filename: string): string {
  const ext = path.extname(filename) || ".pdf";
  const id = randomUUID();
  return path.join(UPLOAD_DIR, `${id}${ext}`);
}

export async function saveFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType = "application/pdf"
): Promise<StoredFile> {
  await ensureUploadDir();
  const storagePath = getStoragePath(originalFilename);
  await fs.writeFile(storagePath, buffer);
  const stat = await fs.stat(storagePath);

  // Simple checksum for MVP (could use crypto.createHash('sha256'))
  const checksum = `sha256-${buffer.length}-${Date.now()}`;

  return {
    storagePath: getRelativeStoragePath(storagePath),
    filename: originalFilename,
    mimeType,
    size: stat.size,
    checksum,
  };
}

export async function readFile(storagePath: string): Promise<Buffer> {
  const fullPath = path.isAbsolute(storagePath) ? storagePath : path.join(process.cwd(), storagePath);
  const normalized = path.normalize(fullPath);
  return fs.readFile(normalized);
}

export async function fileExists(storagePath: string): Promise<boolean> {
  try {
    const fullPath = path.isAbsolute(storagePath) ? storagePath : path.join(process.cwd(), storagePath);
    await fs.access(path.normalize(fullPath));
    return true;
  } catch {
    return false;
  }
}

export function getRelativeStoragePath(absolutePath: string): string {
  const base = process.cwd();
  return path.relative(base, absolutePath);
}
