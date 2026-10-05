// Compress new uploads only; existing stored files and PDFs remain unchanged.
export async function prepareUpload(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size <= 400 * 1024) return file;
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 2200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Foto tidak dapat diproses.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let smallest: Blob | null = null;
    for (const quality of [0.86, 0.78, 0.7]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && (!smallest || blob.size < smallest.size)) smallest = blob;
      if (blob && blob.size <= 600 * 1024) break;
    }
    if (!smallest || smallest.size >= file.size) return file;
    const extension = smallest.type === 'image/webp' ? 'webp' : 'png';
    return new File([smallest], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, {type: smallest.type});
  } catch {
    throw new Error('Foto belum dapat diperkecil. Pilih ulang atau gunakan foto JPG/PNG lain.');
  } finally { URL.revokeObjectURL(url); }
}

export function attachmentLabel(file: {mimeType: string; size: number}) {
  const type = file.mimeType.startsWith('image/') ? 'Foto' : file.mimeType === 'application/pdf' ? 'PDF' : 'File';
  const size = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  return `${type} • ${size}`;
}
