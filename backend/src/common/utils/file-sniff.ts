export type ImageKind = { kind: 'jpeg' | 'png' | 'webp' | 'heic'; label: string; ext: string; mime: string; inline: boolean };

/**
 * Identifies an image by its first bytes (never by file name or the browser's content type).
 * Returns null for anything that isn't a JPEG, PNG, WebP or HEIC picture.
 */
export function sniffImage(buf: Buffer): ImageKind | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { kind: 'jpeg', label: 'JPEG', ext: 'jpg', mime: 'image/jpeg', inline: true };
  if (buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') return { kind: 'png', label: 'PNG', ext: 'png', mime: 'image/png', inline: true };
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return { kind: 'webp', label: 'WebP', ext: 'webp', mime: 'image/webp', inline: true };
  if (buf.toString('latin1', 4, 8) === 'ftyp' && /^(heic|heix|mif1|msf1|hevc)/.test(buf.toString('latin1', 8, 12))) {
    return { kind: 'heic', label: 'HEIC', ext: 'heic', mime: 'image/heic', inline: false };
  }
  return null;
}

/** Makes a client-supplied file name safe to store and show (no paths, no control characters). */
export function cleanFileName(name: string): string {
  // eslint-disable-next-line no-control-regex
  const base = String(name || 'photo').replace(/[\\/]/g, '_').replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '').trim();
  return (base || 'photo').slice(0, 120);
}
