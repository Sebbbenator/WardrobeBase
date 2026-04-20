import { supabase } from './supabase.js';

/**
 * Upload a file (or Blob) to a Supabase Storage bucket.
 * Returns { path, publicUrl }.
 */
export async function uploadImage(bucket, fileOrBlob, { pathPrefix = '', upsert = false } = {}) {
  const ext = guessExtension(fileOrBlob);
  const name = `${pathPrefix}${crypto.randomUUID()}${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(name, fileOrBlob, {
    cacheControl: '3600',
    upsert,
    contentType: fileOrBlob.type || 'image/jpeg',
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(name);
  return { path: name, publicUrl: data.publicUrl };
}

/**
 * Upload to a fixed path, replacing whatever's there. Useful for the single user photo.
 */
export async function uploadImageAtPath(bucket, path, fileOrBlob) {
  const { error } = await supabase.storage.from(bucket).upload(path, fileOrBlob, {
    cacheControl: '0',
    upsert: true,
    contentType: fileOrBlob.type || 'image/jpeg',
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Bust CDN/browser cache on replace.
  return { path, publicUrl: `${data.publicUrl}?t=${Date.now()}` };
}

/**
 * Extract the object path from a Supabase public URL.
 * Returns null if the URL doesn't look like a Supabase public URL for this bucket.
 */
export function extractStoragePath(bucket, publicUrl) {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const pathWithQuery = publicUrl.slice(idx + marker.length);
  return pathWithQuery.split('?')[0];
}

export async function deleteFromStorage(bucket, publicUrl) {
  const path = extractStoragePath(bucket, publicUrl);
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn(`Failed to delete ${bucket}/${path}:`, error.message);
}

function guessExtension(fileOrBlob) {
  const type = fileOrBlob.type || '';
  if (type.includes('png')) return '.png';
  if (type.includes('webp')) return '.webp';
  if (type.includes('gif')) return '.gif';
  return '.jpg';
}
