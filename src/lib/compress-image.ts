import sharp from "sharp";

export type CompressKind = "photo" | "chart" | "sheet";

const PRESETS: Record<
  CompressKind,
  { maxEdge: number; quality: number }
> = {
  // Small enough for fast gallery skimming
  photo: { maxEdge: 720, quality: 62 },
  chart: { maxEdge: 900, quality: 65 },
  // Keep sheet text readable, still much smaller than phone camera originals
  sheet: { maxEdge: 1200, quality: 70 },
};

/**
 * Downscale + WebP-compress uploads so gallery skimming stays fast.
 */
export async function compressImage(
  file: File,
  kind: CompressKind,
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const input = Buffer.from(await file.arrayBuffer());
  const { maxEdge, quality } = PRESETS[kind];

  try {
    const buffer = await sharp(input)
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    return {
      buffer,
      contentType: "image/webp",
      extension: "webp",
    };
  } catch {
    throw new Error(
      "Could not process that image. Please upload a JPEG, PNG, or WebP file.",
    );
  }
}
