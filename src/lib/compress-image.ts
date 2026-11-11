// Reduce las fotos del celular (que pesan 3–8 MB) a ~150–300 KB antes de subirlas.
// Así el catálogo carga rápido con datos móviles y no se llena el espacio gratuito.
const MAX_SIDE = 1400;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la foto.");
  ctx.fillStyle = "#ffffff"; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo comprimir la foto."))),
      "image/jpeg",
      QUALITY,
    ),
  );
}
